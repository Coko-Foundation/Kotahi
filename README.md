# Kotahi

Kotahi is a manuscript submission system, based on the discontinued [xpub-collabra](https://gitlab.coko.foundation/xpub/xpub) project.
It is currently under development by the [Coko Foundation](https://coko.foundation/) and is being built with [Pubsweet](https://gitlab.coko.foundation/pubsweet/pubsweet).

## Installation

Developer beware! This project is currently under very heavy development, so things will most definitely be broken. We also don't have a fixed roadmap for it at this point.

### Running the app

We provide docker-compose and docker files to ensure consistency across environments. The following instructions assume that you have `docker` and/or `docker-compose` installed on your system.

You can use the `docker-compose.yml` and `docker-compose.production.yml` files as a reference for the environment variables that are needed, as well as a kind of installation guide if for some reason you wish to not use docker.
Environment variables must be loaded into your shell. The `docker-compose` cli will automatically load any environment variables specified in the file `<project root>/.env`. You can also load these manually (e.g. via `source .env` on linux). To set up ORCID variables for login, read [FAQ.md](FAQ.md).

#### Development

To bring up the development environment, simply run:

```sh
docker-compose up
```

This will:

- Run the server with `nodemon`, so that changes auto restart the server
- Run the client with webpack dev server, with hot reload enabled
- Bring up a postgres container for use in development
- Register the `job-xsweet` service (which converts .docx files to HTML)

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
