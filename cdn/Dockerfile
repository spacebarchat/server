FROM node:lts-alpine AS builder

WORKDIR /usr/src/util

COPY util .
RUN npm install && npm run build

WORKDIR /usr/src/cdn

COPY cdn/ .
RUN npm install && npm run build

EXPOSE 3001
CMD ["node", "dist/start.js"]
