# Kotahi

[Site & Docs](https://kotahi.community/)

Kotahi is a modern submission, review and publishing system especially suited for academic journals, overlay journals, preprint curation groups, data publications, data review, research labs and PRC (publish-review-curate) groups. Kotahi supports:

- individual **research object submission**
- **bulk imports** of preprints and other documents/data objects for review
- **highly customisable** data and workflows
- **single source**, so that authors, editors, reviewers and production editors work on a single source without needing to send versions back and forth
- **automated export** to various formats including **JATS**, HTML, PDF
- integrations with DOAJ, Crossref, DataCite and more
- a built in, highly customisable **publishing site and CMS** (content management system)
- several **other publishing options** including **DOI registration**
- automated **citation management and structuring tools** via API lookups 
- a **task management** system to guide team-members, plus **in-app chat** and alerts to simplify communication
- **multitenancy**, allowing multiple groups to be hosted in a single instance, and allowing easy experimentation with new workflows
- a **plugin architecture** for custom functionality and easy extensibility
- modern interfaces, architecture, thinking


Kotahi is currently under development by the [Coko Foundation](https://coko.foundation/). 
## Project roadmap

[The Kotahi project roadmap](https://miro.com/app/board/uXjVP7jNtBs=/?share_link_id=747477817280) can be viewed on Miro.

## Contribute

Contributions are welcome! Please read our [Community Products Collaboration Guidelines](https://docs.coko.foundation/s/community-collab) and join our [chat channel](https://mattermost.coko.foundation/coko/channels/kotahi).

## Bug reporting

To report a bug, [open a GitLab issue](https://gitlab.coko.foundation/kotahi/kotahi/-/issues/new) and use the bug-report template contained in the issue.

## Getting started: the quick guide

To install Kotahi locally, you'll need these things:

- A copy of this repo.
- Node & Yarn. Kotahi requires Node 16.
- Docker. Kotahi uses [Docker](https://www.docker.com/) for images of the databases and servers that it uses. Make sure you have Docker installed and running.
- An ORCID account. Kotahi uses [ORCID](https://orcid.org/) for account authentication. It's free and easy to sign up. The [FAQ](FAQ.md) tells you how.
- A working _.env_ file. You can start by copying [.env.example](.env.example) (in the shell: `cp .env.example .env`). The .env file contains passwords and other sensitive information, plus other configuration options.
- In order to work with file attachments you'll need to add the following to your hosts file: `127.0.0.1 filehosting`. (Only needed for a development build.)

Once you have those things, try doing this:

- From the shell in the main directory: `yarn install` to install all the Node packages.
- From the shell: `docker-compose build`, then `docker-compose up` _Only once you have a .env file!_
- If the following error occurs during `docker-compose up`:
  ```
  db-pagedjs_1 | 2022-08-02 14:17:42.683 UTC [29] FATAL:database "pagedjs_dev" does not exit
  pagedjs_1 | error: Error while running migrations: database "pagedjs_dev" does not exist
  ```
  Execute `docker system prune`, then `docker-compose up` once again.
- Point your browser at [http://localhost:4000](http://localhost:4000) – you should be taken to a login page.
- You'll be prompted to login with ORCID. If you don't yet have an ORCID ID, you can login with account number `0000-0001-6819-2182` and password `KotahiDemoAccess2021`. _Only use this account for testing!_
- If you're asked, click "Authorize Access".
- You should be returned to Kotahi; enter an email address to get started. The email you enter will be associated with the ORCID ID in your instance; and the first account created is automatically a system admin, so if you're not just trying out Kotahi, there's a benefit to making your own ORCID ID.

If something doesn't work, read though the details in the next section; or check through the [FAQ](FAQ.md).

## Installation: details

Developer beware! ThisEmpower researchers to create, share and disseminate knowledge in ways that transcend the boundaries of traditional publishing. project is currently under very heavy development, so documentation may be out of date at times.

### Running the app

We provide docker-compose and docker files to ensure consistency across environments. The following instructions assume that you have `docker` and/or `docker-compose` installed on your system.

#### The `.env` file

Several environment variables must be loaded into the shell in order for Kotahi to run correctly. This is usually achieved by specifying these variables in the file `<project root>/.env`, where the `docker-compose` cli will automatically read and load them. Kotahi ships with an example `.env.example` file with typical settings &mdash; you can use it as a guide for your own `.env` file. (Also consult the `docker-compose.yml` and `docker-compose.production.yml` files for a complete list of available variables.)

To load these environment variables for certain scripts, you can use the `dotenv` CLI, e.g. `yarn dotenv yarn test:all:chrome`.

ORCID OAuth variables must be set up before you can log in. See [FAQ.md](FAQ.md).

#### Development

To bring up the development environment, simply run:

```sh
docker-compose build
docker-compose up
```

This will:

- Build the docker images
- Run the server with `nodemon`, so that changes auto restart the server
- Run the client with webpack dev server, with hot reload enabled
- Start a Minio container for storage
- Bring up a postgres container for use in development
- Register the `job-xsweet` service (which converts .docx files to HTML)

By default you can then access your app at [http://localhost:4000/login](http://localhost:4000/login). If you have configured to use HTTPS protocol instead (and are using self-signed certificates), browsers will complain about it being insecure. There are several options to disable these checks for `localhost`, to name a few:

1. Go to `chrome://flags/#allow-insecure-localhost` and enable it (Chrome)
2. Or click anywhere on the page and type `thisisunsafe` (yes, really) (Chrome)
3. Click 'Advanced...' and 'Accept the Risk and Continue' (Firefox)

#### Running integration tests

If you have used `docker-compose` to stand up your app, everything will already be configured and you only then need to

```
> yarn run test:chrome
```

This will load the test runner in your local environment and using the correct environment variables (set in your `.env` file).

Note: On Windows use `npm` to run Cypress related tasks (e.g.`npm run test:chrome`) as there are issues with `yarn`, see [issue #116](https://gitlab.coko.foundation/kotahi/kotahi/-/issues/116).

Note: The environment variables are needed mainly because Cypress generates an authentication token using the User model directly (to bypass ORCID OAuth login which is not possible to emulate via Cypress), and so needs to connect to the database in the same way as the app.

#### Production

To run the app for production with `docker-compose`:

```sh
docker-compose -f docker-compose.production.yml --env-file .env build
docker-compose -f docker-compose.production.yml --env-file .env up
```

This does the following:

- Brings up the server, which will also serve a pre-built webpack static bundle
- Register the `job-xsweet` service

For production, we are making the assumption that you have a running postgres database somewhere. You only need to provide its location and credentials via the environment variables.

Depending on your needs and setup, it might not be a good idea to use the `docker-compose` cli in production. If this is the case, and your container management solution cannot read `docker-compose` files, simply use the `docker-compose.production.yml` file as a reference for what is needed.

### Further setup and development info

See [FAQ.md](FAQ.md).
Conventions for code changes, branching and merge requests are covered in [CONTRIBUTING.md](CONTRIBUTING.md).

