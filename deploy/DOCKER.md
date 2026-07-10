# Deploying with Docker

The whole stack runs from one `docker-compose.yml` at the repo root:

```text
Browser ──> nginx (:80/:443)
             ├── /admin /api /login /storage /uploads /guest /vendor ──> backend  (Laravel, PHP 8.4 + Apache)
             └── everything else (/, /member/*, /console/*, /bff/*) ──> frontend (Next.js standalone)
backend + scheduler ──> db (Postgres 16)
scheduler = same Laravel image running `artisan schedule:work`
```

Config lives in `deploy/docker.env` (gitignored) — copy it from
`deploy/docker.env.example` and fill in `APP_KEY`, the Postgres password,
and the public URLs.

**Build-order rule (matters on the first build and any frontend rebuild):**
`next build` prerenders public pages against the live Laravel API, so the
backend must be up before the frontend image builds. The backend publishes
`127.0.0.1:8000` on the host for exactly this purpose.

---

## 1. Local test of the production topology

```bash
cp deploy/docker.env.example deploy/docker.env   # then edit: APP_KEY, passwords
# optional: put a pg_dump in deploy/db-init/ to start from your dev data

docker compose up -d db backend                  # wait for healthy db + apache
LOCAL_TOPOLOGY_TEST=1 docker compose build frontend
docker compose up -d
```

Browse <http://localhost:8090>. `LOCAL_TOPOLOGY_TEST=1` serves images
unoptimized because the Next image optimizer inside the container can't
reach `localhost:8090`; never set it for a real deployment.

## 2. VPS deployment

Any small VPS works (Hetzner CX22, DigitalOcean basic, etc. — 2 GB RAM is
comfortable). Point your domain's A record at the server first.

```bash
# on the server (Ubuntu/Debian)
curl -fsSL https://get.docker.com | sh
git clone https://github.com/AAAA477/church-cms-laravel.git && cd church-cms-laravel

cp deploy/docker.env.example deploy/docker.env
nano deploy/docker.env
#   APP_KEY=...          <- copy from your local .env (keeps existing encrypted data valid)
#   POSTGRES_PASSWORD / PGSQL_PASSWORD = same strong value
#   APP_URL / FRONTEND_URL / SITE_URL = https://your-domain.com
#   MAIL_* = real SMTP creds when ready
```

### Data + media migration

```bash
# on your dev machine
pg_dump -h 127.0.0.1 -p 5433 -U postgres --no-owner --no-privileges churchcms > churchcms.sql
scp churchcms.sql  root@SERVER:~/church-cms-laravel/deploy/db-init/
# media: git doesn't track uploads, so copy them into the repo tree on the server
scp -r public/uploads       root@SERVER:~/church-cms-laravel/public/
scp -r storage/app/public   root@SERVER:~/church-cms-laravel/storage/app/
```

(The image bakes whatever is in `public/uploads` and `storage/app` at build
time, and the volumes are seeded from the image on first run.)

### Ports, build, start

Edit `docker-compose.yml` ports for production — nginx goes public, and the
backend's build-helper port moves to the docker bridge IP (on Linux,
`host.docker.internal` = the bridge, usually `172.17.0.1`, which can't reach
a loopback-bound port; verify yours with `ip addr show docker0`):

```yaml
  backend:
    ports:
      - "172.17.0.1:8000:80"
  nginx:
    ports:
      - "80:80"
      - "443:443"
```

Then, in order:

```bash
docker compose up -d db backend        # db imports deploy/db-init/*.sql on first boot
docker compose logs -f backend         # wait for "resuming normal operations"
SITE_URL=https://your-domain.com docker compose build frontend
docker compose up -d
```

Site is now live on `http://your-domain.com`.

### TLS (Let's Encrypt)

```bash
docker compose run --rm certbot certonly --webroot -w /var/www/certbot \
    -d your-domain.com --email you@example.com --agree-tos --no-eff-email
```

Then in `deploy/docker/nginx.conf`: uncomment the 443 server block, replace
`example.com` with your domain, and (recommended) reduce the port-80 block to
the ACME location plus `return 301 https://$host$request_uri;`. Reload:

```bash
docker compose exec nginx nginx -s reload
```

Set `APP_URL`/`FRONTEND_URL`/`SITE_URL` to `https://...` in
`deploy/docker.env`, restart backend + scheduler, and rebuild the frontend
(`SITE_URL=https://your-domain.com docker compose build frontend`) so
prerendered pages carry https URLs.

Renewal — add to root's crontab (`crontab -e`):

```text
0 4 * * 1 cd /root/church-cms-laravel && docker compose run --rm certbot renew --quiet && docker compose exec nginx nginx -s reload
```

## 3. Updating the deployed site

```bash
git pull
docker compose build backend && docker compose up -d backend scheduler
SITE_URL=https://your-domain.com docker compose build frontend && docker compose up -d frontend
```

Migrations run automatically at backend start (`MIGRATE_ON_START=1` in
compose). Uploaded media and the database live in named volumes
(`laravel-storage`, `laravel-uploads`, `dbdata`) and survive rebuilds.
`docker compose down -v` destroys them — don't use `-v` on the server.

## 4. Backups

```bash
docker compose exec db pg_dump -U postgres churchcms | gzip > backup-$(date +%F).sql.gz
docker run --rm -v church-cms-laravel_laravel-storage:/s -v $(pwd):/out alpine \
    tar czf /out/media-$(date +%F).tar.gz -C /s app/public
```

## Gotchas learned the hard way

- **nginx 502 after rebuilding a service**: fixed permanently in
  `deploy/docker/nginx.conf` by resolving upstreams through Docker's DNS
  per-request (`resolver 127.0.0.11` + variable `proxy_pass`). Don't revert
  to `upstream {}` blocks.
- **Absolute URLs**: Laravel builds all absolute URLs from `APP_URL`
  (`URL::forceRootUrl` in `AppServiceProvider`), because behind the proxy
  the request Host is an internal service name. Keep `APP_URL` = the real
  public origin.
- **Media URLs stored absolute in the DB**: dev data once contained
  `http://127.0.0.1:8000/...` values (bulletins/events/galleries/sermons
  cover images). They were normalized to relative paths on 2026-07-09; if
  broken images ever reappear after importing an old dump, scan for
  `http://127.0.0.1` in text columns.
- **Frontend build needs the backend**: prerendering fetches live data. If
  `docker compose build frontend` fails with fetch errors, start
  `db` + `backend` first.
