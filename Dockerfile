FROM node:lts-alpine
WORKDIR /usr/src/fosscord-gateway
COPY . .
RUN apk --no-cache --virtual build-dependencies add \
    python \
    make \
    g++
RUN npm install
RUN apk del build-dependencies
EXPOSE 3002
CMD ["npm", "start"]