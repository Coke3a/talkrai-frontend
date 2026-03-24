# Stage 1: Install dependencies
FROM node:22-alpine AS deps
RUN corepack enable pnpm

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# Stage 2: Build the application
FROM node:22-alpine AS build
RUN corepack enable pnpm

WORKDIR /app

ARG NEXT_PUBLIC_LIFF_ID
ARG NEXT_PUBLIC_API_URL

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Ensure public/ exists even if empty (Next.js standalone needs it)
RUN mkdir -p public

RUN pnpm build

# Stage 3: Production runtime
FROM node:22-alpine AS runtime

RUN apk add --no-cache tzdata

ENV TZ=Asia/Bangkok
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

RUN addgroup -g 10001 -S app && \
    adduser -u 10001 -S app -G app

WORKDIR /app

COPY --from=build --chown=app:app /app/.next/standalone ./
COPY --from=build --chown=app:app /app/.next/static ./.next/static

# public/ may be empty; create it so COPY doesn't fail
RUN mkdir -p ./public
COPY --from=build --chown=app:app /app/public/ ./public/

USER app

EXPOSE 3000

CMD ["node", "server.js"]
