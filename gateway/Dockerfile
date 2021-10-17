FROM node:lts-alpine
WORKDIR /usr/src/gateway
COPY gateway/package.json ./
COPY gateway/package-lock.json ./
COPY util ../util
RUN apk --no-cache --virtual build-dependencies add \
    python \
    make \
    g++
RUN cd ../util && npm install && cd ../gateway && npm install
RUN apk del build-dependencies
COPY gateway/ .
RUN npm run build
EXPOSE 3002
CMD ["node", "dist/start.js"]
