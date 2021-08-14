# Kotahi

Kotahi is a manuscript submission system, based on the discontinued [xpub-collabra](https://gitlab.coko.foundation/xpub/xpub) project.
It is currently under development by the [Coko Foundation](https://coko.foundation/) and is being built with [PubSweet](https://gitlab.coko.foundation/pubsweet/pubsweet).

## Installation

Developer beware! This project is currently under very heavy development, so things will most definitely be broken. We also don't have a fixed roadmap for it at this point.

### Running the app

We provide docker-compose and docker files to ensure consistency across environments. The following instructions assume that you have `docker` and/or `docker-compose` installed on your system.

#### The `.env` file

Several environment variables must be loaded into the shell in order for Kotahi to run correctly. This is usually achieved by specifying these variables in the file `<project root>/.env`, where the `docker-compose` cli will automatically read and load them. Kotahi ships with an example `.env.example` file with typical settings &mdash; you can use it as a guide for your own `.env` file. (Also consult the `docker-compose.yml` and `docker-compose.production.yml` files for a complete list of available variables.)

To load these environment variables for certain scripts, you can use the `dotenv` CLI, e.g. `yarn dotenv yarn test:chrome`.

ORCID OAuth variables must be set up before you can log in. See [FAQ.md](FAQ.md).

#### Development

To bring up the development environment, simply run:

```sh
docker-compose up
```

This will:

- Run the server with `nodemon`, so that changes auto restart the server
- Run the client with webpack dev server, with hot reload enabled
- Start a Minio container for storage
- Bring up a postgres container for use in development
- Register the `job-xsweet` service (which converts .docx files to HTML)

By default you can then access your app at [http://localhost:4000](http://localhost:4000). If you have configured to use HTTPS protocol instead (and are using self-signed certificates), browsers will complain about it being insecure. There are several options to disable these checks for `localhost`, to name a few:

1. Go to `chrome://flags/#allow-insecure-localhost` and enable it (Chrome)
2. Or click anywhere on the page and type `thisisunsafe` (yes, really) (Chrome)
3. Click 'Advanced...' and 'Accept the Risk and Continue' (Firefox)

#### Running integration tests

If you're using `docker-compose` to stand up your app, everything will already be configured and you only need to

```
> yarn run test:chrome
```

This will load the test runner in your local environment and using the correct environment variables (set in your `.env` file).

Note: On Windows use `npm` to run Cypress related tasks (e.g.`npm run test:chrome`) as there are issues with `yarn`, see [issue #116](https://gitlab.coko.foundation/kotahi/kotahi/-/issues/116).

Note: The environment variables are needed mainly because Cypress generates an authentication token using the User model directly (to bypass ORCID OAuth login which is not possible to emulate via Cypress), and so needs to connect to the database in the same way as the app.

#### Production

To run the app for production with `docker-compose`:

```sh
docker-compose -f docker-compose.production.yml up
```

This does the following:

- Brings up the server, which will also serve a pre-built webpack static bundle
- Register the `job-xsweet` service

For production, we are making the assumption that you have a running postgres database somewhere. You only need to provide its location and credentials via the environment variables.

Depending on your needs and setup, it might not be a good idea to use the `docker-compose` cli in production. If this is the case, and your container management solution cannot read `docker-compose` files, simply use the `docker-compose.production.yml` file as a reference for what is needed.

### Further setup and development info

See [FAQ.md](FAQ.md).
Conventions for code changes, branching and merge requests are covered in [CONTRIBUTING.md](CONTRIBUTING.md).

# Other credits

The real-time chat functionality was heavily inspired by https://github.com/withspectrum/spectrum, from data model approach to copying and adapting certain bits of their React app. Thank you, Spectrum!
