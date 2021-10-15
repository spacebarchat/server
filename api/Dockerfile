FROM node:lts-alpine AS builder

# needed for native packages (bcrypt, canvas)
RUN apk add --no-cache \
    make \
    gcc \
    g++ \
    python \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    giflib-dev

WORKDIR /usr/src/api

RUN npm rebuild bcrypt --build-from-source \
    && npm install canvas --build-from-source

COPY api/package.json api/package-lock.json ./
COPY util ../util
RUN cd ../util && npm install && cd ../api && npm install

COPY api/ .

RUN npm run build

EXPOSE 3001
CMD ["node", "dist/start.js"]
