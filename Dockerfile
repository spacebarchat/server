FROM node:lts-alpine
WORKDIR /usr/src/fosscord-api
COPY . . 
RUN npm install
RUN npx patch-package
CMD ["npm", "start"]