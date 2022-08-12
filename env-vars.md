#Fosscord Environment Variables:

|NAME|VALUE|DESCRIPTION|
|----|-----|-----------|
|LOG\_REQUESTS | ports to include, or exclude (-) | logs requests |
|PORT|number|sets port number to listen on|
|CDN|string|CDN address|
|GATEWAY|string|Gateway address|
|NODE\_ENV|production/development|sets node environment|
|DATABASE|database url|points to what database to use|
|EVENT\_TRANSMISSION|string|event transmission type|
|STORAGE\_PROVIDER|s3/file|How to store files for CDN|
|STORAGE\_LOCATION|path|Directory to store files in|
|STORAGE\_BUCKET|s3 bucket name|S3 bucket name|
|DB\_UNSAFE|any|Ignores migrations for database, enabled if defined|
|DB\_VERBOSE|any|Log database queries, enabled if defined|
|DB\_MIGRATE|any|Exit fosscord after connecting to and migrating database, used internally|
|LOG\_INVALID\_BODY|any|Log request method, path and body if invalid|
