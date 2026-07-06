# Production topology

One public origin, split by path between Laravel and the Next.js frontend.

```
Browser
  |
  v
Nginx (nginx.conf.example)
  |-- /admin/, /api/, /login, /storage/, /uploads/, /guest/, /vendor/, /_debugbar/  -> Laravel (php-fpm or `php artisan serve`, :8000)
  '-- everything else (/, /sermons, /member/*, /bff/*, ...)                          -> Next.js standalone (pm2, :3000)
```

## Why the split is where it is

- **`/api/*` stays Laravel-only.** The mobile app calls Laravel's API directly. Next.js's own server-side routes (login, donations, contact form, prayer lift) live under **`/bff/*`** instead, specifically so they never collide with Laravel's `/api/*` namespace on the same domain.
- **`/login` is exact-matched to Laravel.** Laravel's admin panel and the Next.js member portal both originally wanted bare `/login`. The member portal now lives at `/member/login` — see `frontend/src/proxy.ts` and `frontend/src/app/member/login/`.
- **Legacy Blade URLs redirect at the Next.js layer**, not Nginx: `frontend/next.config.ts` has a `redirects()` block mapping old paths (`/post/:id`, `/sermon/:id`, `/prayer-requests`, etc.) to their new equivalents. This works because Nginx no longer routes those old public paths to Laravel at all — they fall through to Next's catch-all, where the redirect fires.

## Running it

**Laravel:**
```
php artisan serve
```

**Next.js** (standalone build, must be rebuilt after every code change):
```
cd frontend
npm run build
cp -r .next/static .next/standalone/.next/static
cp -r public .next/standalone/public
pm2 start ecosystem.config.js   # first time
pm2 restart church-cms-frontend # subsequent rebuilds
```

**Nginx:** point it at `nginx.conf.example` (copy into your real `nginx.conf`'s `http {}` block, or `include` it). Adjust `listen`, `server_name`, and add TLS for real production — see comments in the file.

## Known local-dev quirk

`frontend/proxy.ts` must live at `frontend/src/proxy.ts` (next to `src/app/`), not the project root — Next.js only looks for it there when a `src/` directory is in use. It will silently never run if misplaced (no error, no warning) — check the `next build` output for a `ƒ Proxy (Middleware)` line to confirm it's registered.
