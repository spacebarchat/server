FROM node:lts-alpine
RUN mkdir -p /usr/src/fosscord-gateway
WORKDIR /usr/src/fosscord-gateway
COPY package.json /usr/src/fosscord-gateway
RUN apk --no-cache --virtual build-dependencies add \
    python \
    make \
    g++
RUN npm install
RUN apk del build-dependencies
COPY . /usr/src/fosscord-gateway
EXPOSE 3002
CMD ["npm", "start"]