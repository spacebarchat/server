FROM node:lts-alpine
WORKDIR /usr/src/fosscord-gateway
COPY package.json .
COPY package-lock.json .
RUN apk --no-cache --virtual build-dependencies add \
    python \
    make \
    g++
RUN npm install
RUN apk del build-dependencies
COPY . .
RUN npm run build
EXPOSE 3002
CMD ["node", "dist/start.js"]
