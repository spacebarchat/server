# fosscord-docker

# dev environment
This clones the master banch into a docker builder and run a build before starting it.
To run it you need docker and docker-compose
`sudo docker compose up` or `sudo docker compose up -d`

# prod environment

Set the following environment variables in your environment (adapt POSTGRES_USER and POSTGRES_PASSWORD):

`export POSTGRES_USER=postgres`
`export POSTGRES_PASSWORD=postgres`
`export POSTGRES_DATABASE=fosscord`

This clones the master banch into a docker builder and run a build before starting it.
To run it you need docker and docker-compose
`docker-compose -f docker-compose.prod.yaml up` or `docker-compose -f docker-compose.prod.yaml up -d`