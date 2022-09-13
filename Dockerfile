FROM node:alpine

# args 
ARG WAIT_FOR_VERSION=4df3f9262d84cab0039c07bf861045fbb3c20ab7
ARG PUID=1000
ARG PGID=1000

# setup non-root user
RUN deluser --remove-home node && addgroup -S node -g ${PGID} && adduser -S -G node -u ${PUID} node

# install required apps
RUN apk add --no-cache --update git python3 py-pip make build-base cairo-dev pango-dev jpeg-dev giflib-dev librsvg-dev

# add symlinks
RUN ln -s /usr/bin/python3 /usr/bin/python
RUN ln -s /bin/grep /usr/bin/grep

# download wait-for
RUN wget -O /usr/local/bin/wait-for https://raw.githubusercontent.com/eficode/wait-for/${WAIT_FOR_VERSION}/wait-for \
	&& chmod +x /usr/local/bin/wait-for

# Run as non-root user
USER node
RUN git config --global --add safe.directory /srv/fosscord-server/

WORKDIR /srv/fosscord-server/
CMD ["npm", "run", "start:bundle"]