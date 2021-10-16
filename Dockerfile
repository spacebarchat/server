FROM alpine
RUN apk add --update nodejs npm
WORKDIR /usr/src/fosscord-server/
COPY . .
WORKDIR /usr/src/fosscord-server/bundle
RUN npm run setup
EXPOSE 3001
CMD [ "npm", "run", "start:bundle" ]