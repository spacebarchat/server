From node:16-bullseye as builder

WORKDIR devel/
RUN apt-get update ; apt-get upgrade -y ; apt-get install -y python-is-python3 build-essential git
RUN git clone https://github.com/fosscord/fosscord-server.git
RUN cd fosscord-server ; npm i ; npm run setup

From node:16-alpine

EXPOSE 3001
WORKDIR exec
RUN mkdir -p persistent/database ; mkdir -p persistent/storage
RUN apk add --update git
RUN adduser -D fosscord
RUN npm install sqlite3 --save
COPY --from=builder /devel/fosscord-server/ . 
RUN chown fosscord:fosscord -R .

USER fosscord

CMD ["npm", "run", "start"]
