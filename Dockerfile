ARG DEBIAN_CODE=trixie
ARG NODE_VERSION=24
ARG PYTHON_VERSION=3.13
ARG USER_NAME=spacebar
ARG USER_GROUP=$USER_NAME
ARG USER_UID=1000
ARG USER_GID=1000
ARG BASEDIR=/spacebar


FROM python:${PYTHON_VERSION}-slim-${DEBIAN_CODE} AS base_python


FROM node:${NODE_VERSION}-${DEBIAN_CODE}-slim AS base

COPY --from=base_python /usr/local/bin/python* /usr/local/bin/
COPY --from=base_python /usr/local/bin/pip* /usr/local/bin/
COPY --from=base_python /usr/local/lib/python* /usr/local/lib/
COPY --from=base_python /usr/local/lib/libpython* /usr/local/lib/


FROM base AS builder

ARG BRANCH

WORKDIR /build

RUN apt-get update && \
    apt-get install -y --no-install-recommends build-essential pkg-config && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /build/server

COPY . .

RUN npm i \
    && npm run setup


FROM base AS final

ARG USER_NAME
ARG USER_GROUP
ARG USER_UID
ARG USER_GID
ARG BASEDIR

RUN mkdir -p "${BASEDIR}/server" \
    && chown -R "${USER_UID}:${USER_GID}" "${BASEDIR}"

RUN deluser node 2>/dev/null || true \
    && delgroup node 2>/dev/null || true \
    && rm -fr /home/node 2>/dev/null || true \
    && addgroup --gid "$USER_GID" "$USER_GROUP" \
    && adduser \
        --disabled-password \
        --gecos "" \
        --uid "$USER_UID" \
        --gid "$USER_GID" \
        --no-create-home \
        "$USER_NAME"

USER ${USER_NAME}

#@todo: only bring what we need
COPY --chown=${USER_NAME}:${USER_GROUP} --from=builder /build/server "${BASEDIR}/server"

ENV PORT="3001"
ENV CONFIG_PATH="${BASEDIR}/config.json"
ENV DATABASE="${BASEDIR}/database.db"

WORKDIR "${BASEDIR}/server"

ENTRYPOINT [ "npm", "run" ]
CMD [ "start" ]
