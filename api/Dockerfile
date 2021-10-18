FROM node:lts-alpine
# needed for native packages (bcrypt, canvas)
RUN apk add --no-cache make gcc g++ python cairo-dev jpeg-dev pango-dev giflib-dev
WORKDIR /usr/src/fosscord-server
COPY package.json .
COPY package-lock.json .
RUN npm rebuild bcrypt --build-from-source && npm install canvas --build-from-source
RUN npm install
COPY . .
EXPOSE 3001
RUN npm run build-docker
CMD ["node", "dist/start.js"]
