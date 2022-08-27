#Fosscord Environment Variables:

| NAME               | VALUE                            | DESCRIPTION                                                               |
| ------------------ | -------------------------------- | ------------------------------------------------------------------------- |
| LOG_REQUESTS       | ports to include, or exclude (-) | logs requests                                                             |
| PORT               | number                           | sets port number to listen on                                             |
| CDN                | string                           | CDN address                                                               |
| GATEWAY            | string                           | Gateway address                                                           |
| NODE_ENV           | production/development           | sets node environment                                                     |
| DATABASE           | database url                     | points to what database to use                                            |
| EVENT_TRANSMISSION | string                           | event transmission type                                                   |
| STORAGE_PROVIDER   | s3/file                          | How to store files for CDN                                                |
| STORAGE_LOCATION   | path                             | Directory to store files in                                               |
| STORAGE_BUCKET     | s3 bucket name                   | S3 bucket name                                                            |
| DB_UNSAFE          | any                              | Ignores migrations for database, enabled if defined                       |
| DB_VERBOSE         | any                              | Log database queries, enabled if defined                                  |
| DB_MIGRATE         | any                              | Exit fosscord after connecting to and migrating database, used internally |
| LOG_INVALID_BODY   | any                              | Log request method, path and body if invalid                              |
| WEBRTC_PORT_RANGE  | min-max                          | Minimum and maximum port for the WebRTC server                            |
| PUBLIC_IP          | string                           | Public ip of the WebRTC server                                            |
