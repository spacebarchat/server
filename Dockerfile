FROM node:lts-alpine
WORKDIR /usr/src/fosscord-api
COPY package.json .
RUN npm install
COPY . .
EXPOSE 3001
RUN npm run build
CMD ["node", "dist/start.js"]