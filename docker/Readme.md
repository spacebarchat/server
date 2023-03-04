# fosscord-docker

# dev environment
This clones the master banch into a docker builder and run a build before starting it.
To run it you need docker and docker-compose
`sudo docker compose up` or `sudo docker compose up -d`

# prod environment with local file storage

Set the following environment variables in your environment (adapt POSTGRES_USER, POSTGRES_PASSWORD):

`export POSTGRES_USER=postgres`
`export POSTGRES_PASSWORD=postgres`
`export POSTGRES_DATABASE=fosscord`

This clones the master banch into a docker builder and run a build before starting it.
To run it you need docker and docker-compose
`docker-compose -f docker-compose.prod.yaml up` or `docker-compose -f docker-compose.prod.yaml up -d`

At first start you get an
```
db_1        | 2023-03-04 17:28:25.790 UTC [63] ERROR:  relation "config" does not exist at character 31
db_1        | 2023-03-04 17:28:25.790 UTC [63] STATEMENT:  SELECT COUNT(1) AS "cnt" FROM "config" "ConfigEntity"
```

# prod environment with S3 file storage

Set the following environment variables in your environment (adapt POSTGRES_USER, POSTGRES_PASSWORD, S3_BUCKET, S3_BUCKET_NAME,S3_BUCKET_REGION) for more infos please reffer to fosscord docu:

`export POSTGRES_USER=postgres`
`export POSTGRES_PASSWORD=postgres`
`export POSTGRES_DATABASE=fosscord`
`export S3_BUCKET=S3://...`
`export S3_BUCKET_NAME=test`
`export S3_BUCKET_REGION=eu-central-1`


This clones the master banch into a docker builder and run a build before starting it.
To run it you need docker and docker-compose
`docker-compose -f docker-compose.prod.s3.yaml up` or `docker-compose -f docker-compose.prod.s3.yaml up -d`

At first start you get an
```
db_1        | 2023-03-04 17:28:25.790 UTC [63] ERROR:  relation "config" does not exist at character 31
db_1        | 2023-03-04 17:28:25.790 UTC [63] STATEMENT:  SELECT COUNT(1) AS "cnt" FROM "config" "ConfigEntity"
```