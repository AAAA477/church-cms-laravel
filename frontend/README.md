This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Netlify

The repository root includes `netlify.toml`, which tells Netlify to build this
Next.js app from the `frontend/` directory.

Use these settings when creating the Netlify site:

- Base directory: `frontend`
- Build command: `npm run build`
- Publish directory: `.next`

Set these environment variables in Netlify:

- `API_URL`: public HTTPS URL for the Laravel backend, without a trailing slash
- `CHURCH_ID`: single-church id, usually `1`
- `SITE_URL`: optional canonical frontend URL; Netlify's `URL`/`DEPLOY_PRIME_URL`
  values are used when this is not set

The Laravel backend still needs to be hosted separately; Netlify serves the
Next.js frontend and its BFF route handlers.

If Netlify shows its generic "Page not found" screen at `/`, check the deploy
log for `@netlify/plugin-nextjs`. If it is missing, Netlify is serving `.next`
as a static folder instead of running the Next adapter. Clear the deploy cache
and redeploy after pushing `netlify.toml` and this package lockfile.
