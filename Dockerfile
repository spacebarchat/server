FROM node:alpine

# env vars
ENV HTTP_PORT=3001
ENV WS_PORT=3002
ENV CDN_PORT=3003
ENV RTC_PORT=3004
ENV ADMIN_PORT=3005
ENV THREADS=1

# exposed ports (only for reference, see https://docs.docker.com/engine/reference/builder/#expose)
EXPOSE ${HTTP_PORT}/tcp ${WS_PORT}/tcp ${CDN_PORT}/tcp ${RTC_PORT}/tcp ${ADMIN_PORT}/tcp

# install required apps
RUN apk add --no-cache --update git

# Run as non-root user
# RUN adduser -D fosscord
# USER fosscord

copy . /srv/fosscord-server/

WORKDIR /srv/fosscord-server
RUN chmod +x scripts/docker-entrypoint.sh
run rm -rf assets/cache/
ENTRYPOINT ["scripts/docker-entrypoint.sh"]