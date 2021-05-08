FROM node:lts-alpine
RUN mkdir -p /usr/src/fosscord-gateway
WORKDIR /usr/src/fosscord-gateway
COPY package.json /usr/src/fosscord-gateway
RUN npm install
COPY . /usr/src/fosscord-gateway
EXPOSE 3002
CMD ["npm", "start"]