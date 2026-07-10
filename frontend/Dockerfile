# Church CMS — Next.js frontend (public site, /member portal, /console admin).
# output: 'standalone' build, served by the generated minimal server.js.
#
# IMPORTANT: `next build` prerenders public pages, which fetch live data from
# the Laravel API — so the backend must be reachable at build-arg API_URL
# while this image builds. docker-compose passes http://host.docker.internal:8000
# (the backend's host-published port); see deploy/DOCKER.md for the build order.

FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM deps AS build
WORKDIR /app
COPY . .
# Baked into next.config.ts at build time (image remotePatterns, redirects)
# and into any prerendered pages. Runtime env on the running container can
# still override API_URL/CHURCH_ID/SITE_URL for request-time fetches.
ARG API_URL
ARG SITE_URL
ARG CHURCH_ID=1
# "1" only when testing the prod topology on localhost — serves images
# unoptimized since the optimizer can't reach the public origin from there.
ARG LOCAL_TOPOLOGY_TEST=0
ENV API_URL=$API_URL SITE_URL=$SITE_URL CHURCH_ID=$CHURCH_ID \
    LOCAL_TOPOLOGY_TEST=$LOCAL_TOPOLOGY_TEST
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:22-alpine AS run
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000 HOSTNAME=0.0.0.0
# server.js doesn't serve public/ or .next/static unless they're copied in.
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
USER node
EXPOSE 3000
CMD ["node", "server.js"]
