FROM node:lts-alpine
RUN mkdir -p /usr/src/fosscord-api
WORKDIR /usr/src/fosscord-api
COPY package.json /usr/src/fosscord-api
RUN npm install
COPY . /usr/src/fosscord-api
RUN npx patch-package
CMD ["npm", "start"]