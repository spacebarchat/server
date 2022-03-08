FROM node:alpine

# env vars
ENV WORK_DIR="/srv/fosscord-server"
ENV DEV_MODE=0
ENV HTTP_PORT=3001
ENV WS_PORT=3002
ENV CDN_PORT=3003
ENV RTC_PORT=3004
ENV ADMIN_PORT=3005

# exposed ports (only for reference, see https://docs.docker.com/engine/reference/builder/#expose)
EXPOSE ${HTTP_PORT}/tcp ${WS_PORT}/tcp ${CDN_PORT}/tcp ${RTC_PORT}/tcp ${ADMIN_PORT}/tcp

# install required apps
RUN apk add --no-cache --update git python2 py-pip make build-base

# optionl: packages for debugging/development
RUN apk add --no-cache sqlite

# download fosscord-server
WORKDIR $WORK_DIR/src
RUN git clone https://github.com/fosscord/fosscord-server.git .

# setup and run
WORKDIR $WORK_DIR/src/bundle
RUN npm run setup
RUN npm install @yukikaze-bot/erlpack
# RUN npm install mysql --save

# create update script
RUN printf '#!/bin/sh\n\ngit -C $WORK_DIR/src/ checkout master\ngit -C $WORK_DIR/src/ reset --hard HEAD\ngit -C $WORK_DIR/src/ pull\ncd $WORK_DIR/src/bundle/\nnpm run setup\n' > $WORK_DIR/update.sh
RUN chmod +x $WORK_DIR/update.sh

# configure entrypoint file
RUN printf '#!/bin/sh\n\nDEV_MODE=${DEV_MODE:-0}\n\nif [ "$DEV_MODE" -eq 1 ]; then\n    tail -f /dev/null\nelse\n    cd $WORK_DIR/src/bundle/\n    npm run start:bundle\nfi\n' > $WORK_DIR/entrypoint.sh
RUN chmod +x $WORK_DIR/entrypoint.sh

WORKDIR $WORK_DIR
ENTRYPOINT ["./entrypoint.sh"]
