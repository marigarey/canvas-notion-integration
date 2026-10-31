# syntax=docker/dockerfile:1

FROM node:22-alpine

ENV NODE_ENV=production \
    CANVAS_NOTION_STATE_FILE=/app/data/state.json

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --chown=node:node src ./src
RUN mkdir -p /app/data && chown node:node /app/data

USER node
VOLUME ["/app/data"]

CMD ["node", "src/main.js"]
