# Eigenbot — Moltbot on EigenCompute TEE
# Must run as root (EigenCompute TEE constraint), linux/amd64 only

FROM node:22-bookworm

RUN apt-get update && apt-get install -y --no-install-recommends \
    chromium \
    xvfb \
    fonts-liberation \
    fonts-noto-color-emoji \
    dbus \
    && rm -rf /var/lib/apt/lists/*

COPY deploy/start.sh /usr/local/bin/start.sh
RUN chmod +x /usr/local/bin/start.sh

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile --prod

COPY . .
RUN pnpm build

EXPOSE 18789
USER root

ENV DISPLAY=:99
ENV CHROMIUM_PATH=/usr/bin/chromium
ENV NODE_ENV=production

CMD ["/usr/local/bin/start.sh"]
