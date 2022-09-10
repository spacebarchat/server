FROM node:alpine

# env vars
ENV HTTP_PORT=3001
ENV WS_PORT=3002
ENV CDN_PORT=3003

# install required apps
RUN apk add --no-cache --update git python3 py-pip make build-base
RUN ln -s /usr/bin/python3 /usr/bin/python

# Run as non-root user
# RUN adduser -D fosscord
# USER fosscord

EXPOSE ${HTTP_PORT} ${WS_PORT} ${CDN_PORT}

WORKDIR /srv/fosscord-server/
CMD ["npm", "run", "start:bundle"]