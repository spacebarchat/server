FROM node:lts-alpine
WORKDIR /usr/src/fosscord-api
COPY . . 
RUN npm install
RUN npx patch-package
EXPOSE 3001
CMD ["npm", "start"]