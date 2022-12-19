# Fosscord env vars:

| Name             | Value          | Description                                                     |
| ---------------- | -------------- | --------------------------------------------------------------- |
| THREADS          | number         | Number of threads to run Fosscord on when using bundle.         |
| PORT             | number         | Port to listen on                                               |
| DATABASE         | string         | Database connection string. Defaults to SQlite3 at project root |
| CONFIG_PATH      | string         | File path for JSON config, if not using `config` db table       |
| WS_LOGEVENTS     | boolean        | If set, log websocket events from gateway                       |
| CDN              | string         | Lowest priority value for public CDN annoucements               |
| GATEWAY          | string         | Lowest priority value for public gateway annoucements           |
| STORAGE_LOCATION | string         | CDN storage location. File path or S3 bucktet                   |
| STORAGE_PROVIDER | "s3" or "file" | CDN storage provider                                            |
| STORAGE_BUCKET   | string         | S3 bucket name                                                  |
| STORAGE_REGION   | string         | S3 storage region                                               |
