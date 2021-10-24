FROM node:14
WORKDIR /usr/src/fosscord-server/
COPY . .
WORKDIR /usr/src/fosscord-server/bundle
RUN npm run setup
EXPOSE 3001
CMD [ "npm", "run", "start:bundle" ]
