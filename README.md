# Colenso

A web application for searching through and managing a collection of TEI
encoded documents.

This is apart of a Victoria University of Wellington SWEN303 project

## How to run

### With Docker

Requires [`docker-compose`](https://pypi.python.org/pypi/docker-compose/) version 1.6 or above 

Run `docker-compose build && docker-compose up` to start the web service

You will need to populate the database with `docker-compose run web
bin/loaddata`

Known issues: the node server may start before the BaseX server is ready and then never connect,
 to resolve this stop the server by hitting `Ctrl+C` and run `docker-compose up`

Then open `localhost:3000`

### Locally

You need nodejs, npm and BaseX installed and configured

If BaseX config are non-default you need to set the environment variables:

Variable   | Default    | Description
-----------|------------|------------------------------
BASEX_HOST |`localhost` | hostname of server
BASEX_PORT |`1984`      | port for BaseX
BASEX_USER |`admin`     | user to login to BaseX with
BASEX_PASS |`admin`     | password for the `BASEX_USER`

* Run `npm install` to get the dependencies.

* Run `node bin/loadata` to populate the database

* Run `node bin/www` to run the web server OR run `bin/debug` to run the
  server in debug mode.


## License

See [LICENSE.md](LICENSE.md) for more information
