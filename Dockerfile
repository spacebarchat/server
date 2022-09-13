FROM node:alpine

# install required apps
RUN apk add --no-cache --update git python3 py-pip make build-base
RUN ln -s /usr/bin/python3 /usr/bin/python

# Run as non-root user
USER node
RUN git config --global --add safe.directory /srv/fosscord-server/

EXPOSE 3001 3002 3003

WORKDIR /srv/fosscord-server/
CMD ["npm", "run", "start:bundle"]