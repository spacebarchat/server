# fosscord-docker-with-nginx


# prod environment with local file storage

Set the following environment variables in your environment (adapt POSTGRES_USER, POSTGRES_PASSWORD,MAIL_CERTBOT,NGINX_HOST):

`export POSTGRES_USER=postgres`
`export POSTGRES_PASSWORD=postgres`
`export POSTGRES_DATABASE=fosscord`
`export MAIL_CERTBOT=test@test.test`
`export NGINX_HOST=domain.de`

This clones the master banch into a docker builder and run a build before starting it.
To run it you need docker and docker-compose
`docker-compose -f docker-compose.prod.yaml up` or `docker-compose -f docker-compose.prod.yaml up -d`

At first start you get an
```
db_1        | 2023-03-04 17:28:25.790 UTC [63] ERROR:  relation "config" does not exist at character 31
db_1        | 2023-03-04 17:28:25.790 UTC [63] STATEMENT:  SELECT COUNT(1) AS "cnt" FROM "config" "ConfigEntity"
```