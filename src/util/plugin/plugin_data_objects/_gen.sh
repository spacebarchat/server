#!/bin/sh
while read event
do
    if [ ! -f "${event}EventArgs.ts" ]
    then
        echo Making event $event...
        (
            echo "export interface Pre${event}EventArgs {"
            echo '  '
            echo '}'
            echo ''
            echo "export interface On${event}EventArgs {"
            echo '  '
            echo '}'
        ) > ${event}EventArgs.ts
    fi
done < _pdo

echo ''

node ../../../../scripts/gen_index.js .. --recursive