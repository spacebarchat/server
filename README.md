# server-util

add to package.json:

```json
"start": "npm run build:util && npm run build && node dist/",
"build": "tsc -b .",
"build:util": "tsc -b ./node_modules/fosscord-server-util/"
```
