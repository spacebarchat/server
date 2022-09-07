#!/bin/sh
if [ ! -d "node_modules" ]; then apk add --no-cache --update python3 py-pip make gcc; ln -s /usr/bin/python3 /usr/bin/python; npm run setup; fi
if [ ! -d 'dist' ]; then npm run build; fi
