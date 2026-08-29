# ---------- build stage ----------
FROM node:24-alpine AS build
WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile --ignore-scripts

COPY . .
RUN pnpm build

# ---------- runtime stage ----------
FROM node:24-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV DOMAIN=3000

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile --prod --ignore-scripts

COPY --from=build /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main.js"]