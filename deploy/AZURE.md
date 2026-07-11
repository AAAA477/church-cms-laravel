# Deploying free(-ish): Netlify frontend + Azure Container Apps backend

An alternative to the VPS path in [DOCKER.md](DOCKER.md) that targets ~$0/month.

```text
Browser ──> Netlify (Next.js frontend: public site, /member, /console, /bff)
             └─ server-side API calls ──> backend (Azure Container App, Laravel, scale 0–1)
Browser ──> backend directly for media/admin: /storage /uploads /api /login
cron Job (*/5 min) ──> php artisan schedule:run   (same backend image)
backend ──> Neon free Postgres (external)
backend media dirs ──> Azure Files shares (the one paid piece: pennies/month)
Backend image lives in GitHub Container Registry (free); built locally, pushed.
```

## What's free and what isn't

| Piece | Cost |
|---|---|
| Netlify (frontend) | Free tier — builds from the GitHub repo (`netlify.toml` is committed) |
| Container Apps compute | Free grant: 180k vCPU-s + 360k GiB-s + 2M requests/mo — plenty for one scale-to-zero backend + the cron job |
| HTTPS on `*.azurecontainerapps.io` / `*.netlify.app` | Free (custom domains + managed certs also free on both) |
| Neon Postgres (neon.tech) | Free tier, ~0.5 GB — already set up; creds in gitignored `deploy/neon.env` |
| GHCR image hosting | Free |
| Azure Files (media) | **Not free**: ~$0.10–0.50/mo for a few GB |

Trade-offs vs the VPS: backend **cold starts** (first API hit after idle waits
~5–15 s), scheduler granularity 5 min, and the site spans two hostnames
(Netlify frontend + Azure backend) instead of one nginx origin — the app
already supports that split (`API_URL` ≠ `SITE_URL`, CORS via `FRONTEND_URL`,
absolute URLs from `APP_URL`).

**Why media needs Azure Files:** ACA containers have no persistent disk — on
every scale-to-zero or redeploy the filesystem resets to the image, so
anything uploaded through the console (logos, slides, covers, avatars) would
404 minutes later. Two SMB shares mounted over `storage/app/public` and
`public/uploads` fix that. Mounts hide the image's baked-in media, so the
shares must be seeded once (step 4).

## 0. Prerequisites

- Azure free account (credit card for identity; set a budget alert during signup)
- [az CLI](https://learn.microsoft.com/cli/azure/install-azure-cli) + `az extension add -n containerapp`
- neon.tech account
- GitHub PAT with `write:packages` for GHCR
- Local Docker (you build images here)

## 1. Database on Neon — DONE (2026-07-10)

Project created (Postgres 18, us-east-1), full dev DB imported and verified
end-to-end. Credentials live in the gitignored `deploy/neon.env`. Use the
**direct** endpoint (not `-pooler`) for Laravel and any re-imports:

```bash
pg_dump -h 127.0.0.1 -p 5433 -U postgres --no-owner --no-privileges churchcms > fresh.sql
psql -f fresh.sql "postgresql://USER:PASS@DIRECT-NEON-HOST/neondb?sslmode=require"
```

Laravel connects with the `PGSQL_*` values from `deploy/neon.env` (the pgsql
connection uses `sslmode=prefer`, which negotiates TLS with Neon).

## 2. Push the backend image

```bash
docker login ghcr.io -u YOUR_GH_USER   # password = the PAT
docker compose build backend
docker tag church-cms-laravel-backend ghcr.io/YOUR_GH_USER/church-cms-backend:latest
docker push ghcr.io/YOUR_GH_USER/church-cms-backend:latest
```

(Mark the GHCR package public in GitHub → Packages, or add a registry
secret to the container apps; public is simpler.)

## 3. Resource group, environment, storage

```bash
az login
az group create -n church-cms -l canadacentral
az containerapp env create -n church-env -g church-cms -l canadacentral

az storage account create -n churchcmsmedia -g church-cms -l canadacentral --sku Standard_LRS
az storage share-rm create --storage-account churchcmsmedia -g church-cms -n laravel-storage
az storage share-rm create --storage-account churchcmsmedia -g church-cms -n laravel-uploads

KEY=$(az storage account keys list -n churchcmsmedia -g church-cms --query "[0].value" -o tsv)
az containerapp env storage set -n church-env -g church-cms \
  --storage-name laravel-storage --azure-file-account-name churchcmsmedia \
  --azure-file-account-key "$KEY" --azure-file-share-name laravel-storage --access-mode ReadWrite
az containerapp env storage set -n church-env -g church-cms \
  --storage-name laravel-uploads --azure-file-account-name churchcmsmedia \
  --azure-file-account-key "$KEY" --azure-file-share-name laravel-uploads --access-mode ReadWrite
```

## 4. Seed the media shares (one-time)

```bash
az storage file upload-batch --account-name churchcmsmedia --account-key "$KEY" \
  -d laravel-storage -s ./storage/app/public
az storage file upload-batch --account-name churchcmsmedia --account-key "$KEY" \
  -d laravel-uploads -s ./public/uploads
```

## 5. Backend container app

```bash
az containerapp create -n church-backend -g church-cms --environment church-env \
  --image ghcr.io/YOUR_GH_USER/church-cms-backend:latest \
  --target-port 80 --ingress external \
  --cpu 0.5 --memory 1Gi --min-replicas 0 --max-replicas 1 \
  --env-vars APP_NAME=ChurchCMS APP_ENV=production APP_DEBUG=false \
    APP_KEY=YOUR_APP_KEY CHURCH_INSTALLED=true PRIMARY_CHURCH_ID=1 \
    DB_CONNECTION=pgsql PGSQL_HOST=YOUR-NEON-HOST PGSQL_PORT=5432 \
    PGSQL_DATABASE=churchcms PGSQL_USERNAME=NEON_USER PGSQL_PASSWORD=NEON_PASS \
    TRUSTED_PROXIES="*" LOG_CHANNEL=stderr CACHE_DRIVER=file SESSION_DRIVER=file \
    QUEUE_DRIVER=sync MIGRATE_ON_START=1 APP_TIMEZONE=UTC TIMEZONE=UTC

BACKEND=https://$(az containerapp show -n church-backend -g church-cms \
  --query properties.configuration.ingress.fqdn -o tsv)
az containerapp update -n church-backend -g church-cms \
  --set-env-vars APP_URL=$BACKEND
```

Mount the shares (easiest via `az containerapp update --yaml` or the portal:
Volumes → add both env storages, then mount `laravel-storage` at
`/var/www/html/storage/app/public` and `laravel-uploads` at
`/var/www/html/public/uploads`).

## 6. Frontend on Netlify

Only possible once the backend (step 5) is live — Netlify's build prerenders
pages against the real API.

1. netlify.com → Add new site → **Import an existing project** → GitHub →
   `AAAA477/church-cms-laravel`. The committed `netlify.toml` supplies the
   base dir (`frontend/`), Node 22 and the Next.js runtime automatically.
2. Before the first deploy, add environment variables (Site configuration →
   Environment variables):
   - `API_URL` = the backend URL from step 5 (e.g. `https://church-backend.<env>.canadacentral.azurecontainerapps.io`)
   - `CHURCH_ID` = `1`
   - (`SITE_URL` optional — sitemap/robots fall back to Netlify's own URL)
3. Deploy. Then point the backend's CORS at the Netlify URL:

```bash
az containerapp update -n church-backend -g church-cms \
  --set-env-vars FRONTEND_URL=https://YOUR-SITE.netlify.app
```

Redeploys: pushing to `main` rebuilds Netlify automatically. If the backend
URL ever changes, update `API_URL` in Netlify and trigger a redeploy.

## 7. Scheduler as a cron Job

```bash
az containerapp job create -n church-scheduler -g church-cms --environment church-env \
  --image ghcr.io/YOUR_GH_USER/church-cms-backend:latest \
  --trigger-type Schedule --cron-expression "*/5 * * * *" \
  --replica-timeout 300 --cpu 0.25 --memory 0.5Gi \
  --command "php" "artisan" "schedule:run" \
  --env-vars <same backend env vars>
```

`schedule:run` executes whatever is due, so the every-minute devotion
publisher runs on each tick (up to 5 min late — acceptable), and the hourly
and daily jobs fire on the :00 ticks.

## 8. Updates

- **Frontend**: push to `main` — Netlify rebuilds automatically.
- **Backend**:

```bash
docker compose build backend
docker tag church-cms-laravel-backend ghcr.io/YOUR_GH_USER/church-cms-backend:latest
docker push ghcr.io/YOUR_GH_USER/church-cms-backend:latest
az containerapp update -n church-backend -g church-cms \
  --image ghcr.io/YOUR_GH_USER/church-cms-backend:latest
```

## Caveats

- **Cold starts**: min-replicas 0 is what keeps the backend free. Setting
  min-replicas 1 consumes far more than the monthly grant.
- **File cache/sessions are ephemeral** (reset on scale-to-zero). Nothing
  critical uses them today except GCash's pending-payment cache entry — if
  GCash goes live on this topology, switch `CACHE_DRIVER` to database/redis.
- **Set a budget alert** (Cost Management → Budgets, e.g. alert at $1) so an
  accidental always-on replica can't surprise you.
- Custom domains later: Netlify domain settings for the frontend (update
  `SITE_URL` + backend `FRONTEND_URL`), `az containerapp hostname add` for
  the backend (update `APP_URL` + Netlify's `API_URL`, redeploy Netlify).
