FROM node:lts-alpine

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

WORKDIR /usr/src/fosscord-api

RUN npm rebuild bcrypt --build-from-source \
    && npm install canvas --build-from-source

COPY api/package.json api/package-lock.json ./
COPY util ../util
RUN npm install

COPY api/ .

RUN npm run build

EXPOSE 3001
CMD ["node", "dist/start.js"]
