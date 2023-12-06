# FAQ

## Getting started

### How do I setup ORCID for development?

Login requires [ORCID](https://orcid.org/) to be set up correctly. By default, if `NODE_ENV` is set to `development`, the app will expect you to be using an account on ORCID's sandbox (this can be overridden via the `USE_SANDBOXED_ORCID` flag). ORCID's sandbox will only send emails to mailinator accounts, so you have to register on ORCID's sandbox with a mailinator one-time email address.

Here's how to set this up in less than 20 easy steps:

1. Go to [mailinator.com](https://mailinator.com)
2. In the search bar at the top of the page enter your desired username (we'll use `mycokotestemail` for this guide) and click "GO". (tip: choose a username that is unlikely to be used already by someone else)
3. You'll be taken to a new page. This is your inbox for `mycokotestemail@mailinator.com`. Keep this page open. (also keep in mind that this is a fully **public** inbox)
4. Go to [sandbox.orcid.org](https://sandbox.orcid.org)
5. Click on "SIGN IN/REGISTER", then on "register now"
6. Fill out the form. In the email field use your newly created mailinator email.
7. Fill out the rest of the form until you register.
8. You'll be taken to your dashboard. Click on your name at the top right, then "Developer Tools".
9. Click on the "Verify your email address to get started" button.
10. Go to your mailinator inbox. Open the email you received from orcid and click on the "Verify your email address" button.
11. Go back to your developer tools section in ORCID. Click on "Register for the free ORCID public API", check the consent box and click on "Continue".
12. You should now be presented with a form. Fill in your application's name, website and description. What you put in these fields shouldn't matter, as this will only be used for development, so you could enter e.g. `kotahi dev`, `http://www.google.com` (any valid URL), `description`.
13. Under "Redirect URIs", add the url of your kotahi client plus `/auth/orcid/callback`. So if in your browser you can see your app under `http://localhost:4000`, the value here should be `http://localhost:4000/auth/orcid/callback`. [1] (Note: ORCID supports multiple redirect URIs, so you can add both http and https URIs if needed.)
14. Click on the floating save icon on the right.
15. You should now be presented with a gray box that gives you a client id and a client secret.
16. Edit your environment file (copy `.env.orcid.example` to `.env` if you don't have one yet) to include the client id and client secret from the step above, e.g.

```
USE_SANDBOXED_ORCID=true
ORCID_CLIENT_ID=APP-B6O346VLWWXBQ427
ORCID_CLIENT_SECRET=b37055db-4405-4dfb-a547-d393cd63bb2a
```

17. (Re-)Start the app via `docker-compose up`.

You should now be able to use the login at `http://localhost:4000/login`.

18. If clicking on the Login with ORCHID or Register with ORCHID button the following error message occurs

Error: The provided client id APP-QOSMNFDSJDSIJDSDS # please make your own! see https://gitlab.coko.foundation/kotahi/kotah-/blob/main/FAQ.md#how-do-i-setup-orcid-for-development is invalid.

Then remove the comment available after client id, provided by you in the .env file available in the directory, where you have
pulled Kotahi code from gitlab.

_Disclaimer: ORCID is a separate organisation from Coko and we are in no way affiliated with them. This is meant as a guide to make a developer's life easier. If you encounter issues with ORCID services not working as expected, please contact their support._

[1] Even though this URL does not exist for the client (ie. it isn't handled by our `react-router` setup), it will be redirected to the server via `webpack-dev-server`'s proxy.

#### Why is ORCID's login page not loading?

ORCID seems to be reliant on Google Tag Manager, so ad-blocker or tracker-blocker extensions in your browser may interfere with authentication.

### Flax content management system

Kotahi includes a microservice, Flax, which serves as a Content Management System (CMS) for Kotahi allowing publication of manuscripts, reviews and evaluations directly to a public-facing site.

Multiple Page Management: alongside the article and evaluation pages, you can add supporting pages such as "About Us", policy pages, contact information, etc, as well as configuring headers and footers for all pages. All this is configured from the CMS section on the Kotahi site.

The publication site's appearance, including color theme and layout, can be customized to your preferences.

The publication site will be built the first time you publish an article or any CMS page.

#### Configuring for Flax:

The following variables must be set in the `.env` file (`.env.example` provides sensible defaults for local development):

- `FLAX_EXPRESS_PORT`: e.g. 8082: a port number for the Express server.
- `FLAX_EXPRESS_HOST=kotahi-flax-site`: Typically this should not change, as it references the `kotahi-flax-site` docker container where the Express server resides.
- `FLAX_SITE_PORT`: e.g. 8081: the port for running the Flax site.
- `FLAX_CLIENT_ID`: choose a random ID
- `FLAX_CLIENT_SECRET`: choose a password
- `FLAX_CLIENT_API_URL`: The Kotahi site origin used by Flax to fetch data from Kotahi. Typically `http://client:4000` for local development.
- `FLAX_SITE_URL`: The desired origin for accessing and running the Flax site. For example, `http://localhost:8081` or `https://myflaxdomain.org`.

When configuring DNS for a production installation, Flax and Kotahi will need two separate DNS configurations. They can differ by subdomain, or you may choose to provide entirely separate domains for the two. Just ensure that `FLAX_SITE_URL` and `FLAX_CLIENT_API_URL` are set correspondingly.

### What should PUBLIC_CLIENT_PROTOCOL, PUBLIC_CLIENT_HOST and PUBLIC_CLIENT_PORT be set to?

These environment variables are only needed for an instance where the client's public address is different to the address by which the server accesses it. For instance, when deploying behind a proxy, or when deploying a _development_ instance to a remote server (not to localhost). Otherwise, you can leave these unset.

### All I see is a "Recent publications" page with no publications. How do I login?

Click **Dashboard** in the upper right. You'll be taken to the login flow.

### Can I run Kotahi without docker-compose?

Certainly. In the absence of `docker-compose`, the server and client will still load the `.env` file, so that remains the preferred means of configuration. You should consult the `docker-compose.yml` and `docker-compose.production.yml` files as a kind of installation guide if for some reason you wish to not use docker.

### What if I want to use my own PostgreSQL instance (i.e. not via `docker-compose`)?

Create a local postgres database named `kotahidev` and a superuser `kotahidev` using `psql`, set a password for it too. We're using `kotahidev`, as the app is configured for that by default, but your database details can of course be different.

```
> psql
user=# create database kotahidev;
user=# create user kotahidev with superuser;
user=# alter role kotahidev with password 'kotahidev';
```

And then install the `pgcrypto` extension to the `kotahidev` database:

```
> psql -d kotahidev -U kotahidev
kotahidev=# create extension pgcrypto;
```

Migrate the test database using `yarn dotenv yarn pubsweet migrate`.

## Publishing

### How do I publish from Kotahi?

While Kotahi deals with importing, reviewing, editing and preproduction, the final step of publishing to the web (or to print) is relegated to other tools. A wide variety of tools exist for building a static website from structured data; you may wish to use Coko Flax which is built expressly for this task.

Kotahi provides a GraphQL API for obtaining published article data; see [API](#api) below.

Kotahi can also be configured to trigger a webhook whenever an article is published, using the following environment variables:

- `PUBLISHING_WEBHOOK_URL` -- the location of the webhook
- `PUBLISHING_WEBHOOK_TOKEN` -- (optional) a token to pass to the webhook for authentication
- `PUBLISHING_WEBHOOK_REF` -- (optional) a reference to pass to the webhook instead of the manuscript ID

If `PUBLISHING_WEBHOOK_URL` is set, then every time you publish an article a POST request will be sent to the webhook, with variables `ref` and (if a token is configured) `token`. The ref will either be the published manuscript ID or the content of `PUBLISHING_WEBHOOK_REF` if that is set.

Using a tool like Flax, you can either:

- respond to every webhook request by requesting the relevant article from Kotahi and building (or rebuilding) its page (plus index pages); or
- periodically request all articles published after the date of the most recent article you've already received.

### Crossref

#### Registering a DOI for an article with Crossref

Crossref offers a paid service for indexing articles and registering DOIs. Kotahi can be configured to register articles with new DOIs upon publication. It can also be configured to register evaluations of articles. The following environment variables are needed:

```
JOURNAL_NAME="Your Journal Name"
JOURNAL_ABBREVIATED_NAME="AbbrvJournName"
JOURNAL_HOMEPAGE="http://yourjournal.com/"
CROSSREF_LOGIN=crossrefLogin
CROSSREF_PASSWORD=crossrefPassword
CROSSREF_REGISTRANT="Crossref Registrant Name"
CROSSREF_DEPOSITOR_NAME="Crossref Depositor Name"
CROSSREF_DEPOSITOR_EMAIL="depositor-email@yourjournal.com"
CROSSREF_PUBLICATION_TYPE=article
CROSSREF_USE_SANDBOX=true
DOI_PREFIX=12.34567
PUBLISHED_ARTICLE_LOCATION_PREFIX=http://yourjournal.com/article/
PUBLICATION_LICENSE_URL=https://creativecommons.org/licenses/by/4.0/
```

Crossref login, registrant and depositor information, as well as your organization-specific DOI prefix, should be organized with Crossref. In order to register an article's DOI, the article should be published to a public facing site (typically using Flax, above). The `PUBLISHED_ARTICLE_LOCATION_PREFIX` will be used to predict the published article's URL, by appending the article's `shortId` (manuscript number) to it. Flax (or your tool of choice) should be configured with this in mind.

For development and testing, `CROSSREF_USE_SANDBOX` should be true. This will send all requests to Crossref's test API. Note that you must request Crossref to give you access to the test API, for which a separate password may be issued.

If a submission to Crossref fails basic schema validation (e.g. if required fields are missing), Kotahi will report the failure beneath the "Publish" button. Success at this point does not guarantee that the submission will succeed once Crossref retrieves it from its queue for processing: it can still fail for reasons such as containing invalid DOI references, etc, _and this failure will not be reported by Kotahi_. You can view Crossref's queue and check whether a submission has succeeded via Crossref's submission administration dashboard at `https://doi.crossref.org/servlet/useragent` or `https://test.crossref.org/servlet/useragent`.

#### Form fields for publishing an article to Crossref

Publishing to Crossref requires that you have certain fields configured via the form-builder. These are:
| Field name | Field type | Purpose |
| --------------------------------------------------- | -------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `meta.title` | TextField | Article title |
| `submission.authors` | AuthorsInput | Ordered list of authors |
| `meta.abstract` | AbstractEditor | Article abstract |
| `submission.citations` _or_ `submission.references` | AbstractEditor | Citations in separate paragraphs |
| `submission.volumeNumber` | TextField | (Optional) Journal volume number |
| `submission.issueNumber` | TextField | (Optional) Journal issue number |
| `submission.issueYear` | TextField | The year of publication. If `submission.volumeNumber` is formatted as a year (e.g. 2021), then `submission.issueYear` is optional. |
|`submission.doiSuffix` | TextField | (Optional) The custom DOI suffix for the article |

#### Registering article evaluations via Crossref

Alternatively, you may be using Kotahi to publish evaluations of pre-existing articles. If this is your workflow, Kotahi can register these evaluations with Crossref, generating a DOI for each. The following environment variables are required for this:

```
CROSSREF_LOGIN=crossrefLogin
CROSSREF_PASSWORD=crossrefPassword
CROSSREF_REGISTRANT="Crossref Registrant Name"
CROSSREF_DEPOSITOR_NAME="Crossref Depositor Name"
CROSSREF_DEPOSITOR_EMAIL="depositor-email@yourjournal.com"
CROSSREF_PUBLICATION_TYPE=evaluations
CROSSREF_USE_SANDBOX=true
DOI_PREFIX=12.34567
```

And the following form fields are required:

| Field name                                                                                                                                                                                                       | Field type     | Purpose                                                  |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- | -------------------------------------------------------- |
| `submission.articleURL`                                                                                                                                                                                          | TextField      | The DOI link to the article under review                 |
| `submission.review1`                                                                                                                                                                                             | AbstractEditor | Review number 1                                          |
| `submission.review1date`                                                                                                                                                                                         | TextField      | Review 1 date, formatted as yyyy-mm-dd or mm/dd/yyyy     |
| `submission.review1creator`                                                                                                                                                                                      | TextField      | Review 1 author, formatted as Firstname Lastname         |
| `submission.review1suffix`                                                                                                                                                                                       | TextField      | (Optional) Review 1 custom DOI sufix                     |
| `submission.review2`, `submission.review2date`, `submission.review2creator`, `submission.review2suffix`, `submission.review3`, `submission.review3date`, `submission.review3creator`, `submission.review3suffix` | As above       | (Optional) Fields for second and third reviews.          |
| `submission.summary`, `submission.summarydate`, `submission.summarycreator`, `submission.summarysuffix`                                                                                                          | As above       | (Optional) Fields for a summary of the reviews.          |
| `submission.description`                                                                                                                                                                                         | TextField      | Title of the article under review, possibly abbreviated. |

### Hypothesis

[Hypothes.is](https://web.hypothes.is) is a tool for annotating webpages and sharing those annotations. It is powered by the hypothesis browser plugin, which displays annotations (retrieved from Hypothesis's servers) when you visit an annotated webpage. It allows evaluations of articles or other data to be shared (publicly or with a select group) directly on the page where the article lives. Kotahi supports publishing most form data as Hypothesis annotations.

To enable this, you will need to first [generate a personal API token](https://h.readthedocs.io/en/latest/api/authorization/#access-tokens) for Hypothes.is, and a [group key](https://web.hypothes.is/blog/introducing-groups/) (e.g. `g4JPqbk5` if your group URL is `https://hypothes.is/groups/g4JPqbk5/my-journal-group`).

Using these keys, set the following `.env` variables:

```
HYPOTHESIS_API_KEY=<your API key here>
HYPOTHESIS_GROUP=<group key here>
HYPOTHESIS_ALLOW_TAGGING=true
```

Your submission form must also contain a field with the internal name `submission.biorxivURL` or `submission.link`, which should contain the URL of the page to be annotated.

Once these preliminaries are in place, there are two approaches to publishing to Hypothesis. Both can be used at the same time:

#### Selecting individual fields to publish to Hypothesis

In the form-builder, you can choose fields of the submission and decision forms to be published to Hypothesis, by setting the "Include when sharing or publishing" option for those fields to "Always" (currently unavailable for SupplementaryFiles and VisualAbstract field types). This will cause each of those fields to be published as Hypothesis annotations when a manuscript is published. If you want Hypothesis to apply a tag to the annotation, this can be specified in the "Hypothes.is tag" text box.

Alternatively, you may choose the "Ad hoc" option for a field, which will cause a "Publish" checkbox to appear next to that field in the Control page (in ThreadedDiscussion fields, each comment has its own separate checkbox). For any given manuscript, an editor must manually select that field (or comment) in order for it to publish to Hypothesis. They should select those they wish to publish, then hit the "Publish" button.

Each selected field or comment (if it is not empty) will be published as a separate Hypothesis annotation. An annotation can be updated or deleted by modifying the contents of the field or deselecting the "Publish" checkbox, and pressing the "Publish" button again.

##### Ordering of published annotations

Threaded discussion comments are published first, in date order; then submission form fields (in the order they appear in the form); then decision form fields (in the order they appear in the form).

This ordering can be overridden by adding `HYPOTHESIS_REVERSE_FIELD_ORDER=true` to the `.env` file. This will not change the ordering of threaded discussion comments, but will reverse the order of all other annotations. This is occasionally useful if you wish fields to appear with a top-to-bottom ordering within the context of a bottom-to-top chronological listing (e.g. if annotations will become TRiP listings).

Note that publishing of review fields to hypothes.is is not yet supported.

#### Publishing Hypothesis annotations with DocMaps

Alternatively (or as well), you can specify one or more Hypothesis annotations to create for each published manuscript, each containing whatever field or combination of fields you choose, by providing a file `config/journal/docmaps_scheme.json` on your server. This mechanism allows more complex selections of data to be published; furthermore, a [DocMap](https://docmaps.knowledgefutures.org/) will also be created at time of publishing, which can be retrieved using kotahi's public API (see below). An example file, [`config/journal/example_docmaps_scheme.json`](https://gitlab.coko.foundation/kotahi/kotahi/-/blob/main/config/journal/example_docmaps_scheme.json), is supplied.

The `docmaps_scheme.json` file specifies the _actions_ to perform when a manuscript is published, complete with participant information and directives to determine how the outputs are generated. Essentially, its structure is copied into the `actions` node of a full DocMap, expanding any templated values and replacing special directives with generated data.

Three special directives (with double-underscore prefix) may be present in each `output` node of the JSON. These are:

- `__contentVenues`: an array of venues to publish to. Currently only 'hypothesis' is supported.
- `__content`: a template string specifying the content (typically a data field or fields) to publish.
- `__tag` (optional): a tag (string) to apply to the annotation in Hypothesis.

[Handlebars](https://handlebarsjs.com/guide/) templates can be included in any string value in the `docmaps_scheme.json` file, to allow insertion of manuscript data. All fields from submission and decision forms can be referenced by their internal name, e.g. `{{submission.authors}}` or `{{decision.verdict}}`. Other supported fields are:

- `{{title}}`: The manuscript title, taken from one of several possible fields commonly used to store the title
- `{{uri}}`: The preprint location, taken from one of several possible fields commonly used to store this location
- `{{doi}}`: The preprint's DOI, taken from one of several possible fields commonly used to store DOI
- `{{meta.title}}`,
- `{{meta.abstract}}`,
- `{{status}}`

A typical use-case is a follows:

1. An evaluation of a preprint is completed in Kotahi.
2. An editor hits the 'Publish' button, causing the fields containing the evaluation to be published as a Hypothesis annotation, and a DocMap to be generated.
3. An automated external service scrapes the new annotation from Hypothesis. This service then queries the `docmap` API in Kotahi, passing the preprint's URI as the parameter.
4. Kotahi returns the requested docmap, which contains supplementary information needed by the external service, e.g. the participant who authored the evaluation.

##### Annotations can also be viewed in Kotahi

Whenever a Hypothesis annotation is generated by Kotahi, the same content is also duplicated as a publicly-accessible page hosted in Kotahi. DocMaps generated by Kotahi will contain a link to this page, as well as a link to the Hypothesis annotation.

## Production tools

The Production page provides tools for semantic tagging of manuscripts uploaded to Kotahi, facilitating export of structured data such as JATS. It also provides controls to download the manuscript and metadata as PDF, HTML or JATS.

#### Citation manager

One of the "Back matter" tools is named "Reference". Highlight one or more references in a reference list and click "Reference" to obtain structured-data for them. Suggested structured data will be sought from CrossRef and AnyStyle, and a list icon will appear to the right of the citation once all suggestions have arrived. Then you may click on the reference to be shown the list of suggestions: choose the best one or edit it manually. Typically there will be at least one correct suggestion you can use without editing.

The suggestion you choose (or edit) will be formatted with CiteProc to match your organisation's chosen citation style. Structured data will also be stored for that citation, so that rich citation data can be exported to JATS.

##### Setting up CrossRef

CrossRef searches for possible matching citations from a large database of citations, all with semantic structure.

You must provide a valid email address in `Configuration > Production > Email to use for citation search`. Here you can also choose citation style and locale for formatting.

##### Setting up AnyStyle (optional)

AnyStyle is an optional component of the tool, especially useful when CrossRef doesn't find a good match to a citation. It attempts to parse the citation as it appeared in the manuscript, to determine its semantic structure. To use AnyStyle, you must set up an AnyStyle server and database -- see `docker-compose.yml` for setup.
Then add the following to your .env, substituting your own secrets:

```
SERVICE_ANYSTYLE_CLIENT_ID=59a3392b-0c4f-4318-bbe2-f86eff6d3de4
SERVICE_ANYSTYLE_SECRET=asldkjLKJLaslkdf897kjhKUJH
SERVICE_ANYSTYLE_PROTOCOL=http
SERVICE_ANYSTYLE_HOST=anystyle
SERVICE_ANYSTYLE_PORT=4567
```

For a non-local AnyStyle server, the host will be its `subdomain.domain`, and protocol will typically be `http`.

## API

Kotahi exposes a graphql API for external access. The available queries are:

- `manuscriptsPublishedSinceDate(startDate: DateTime, limit: Int, groupName: String): [PublishedManuscript!]!` returns published manuscripts for the specified group, with an optional startDate and/or limit. `groupName` can be omitted if there is only one active group.
- `publishedManuscript(id: ID!): PublishedManuscript` returns a single published manuscript by ID, or null if this manuscript is not published or not found.
- `unreviewedPreprints(token: String!, groupName: String): [Preprint!]!` returns a list of manuscripts with the `readyToEvaluate` label, for the specified group. `groupName` can be omitted if there is only one active group.
- `docmap(externalId: String!, groupName: String): String!` returns a [DocMap](https://docmaps.knowledgefutures.org/) from the specified group, representing the relationship between a given preprint (`externalId` is the preprint's URL) and related artifacts such as evaluations that have been published from Kotahi. See above for how to enable this. `groupName` can be omitted if there is only one active group.

Consult the code [here](https://gitlab.coko.foundation/kotahi/kotahi/blob/main/server/model-manuscript/src/graphql.js) and [here](https://gitlab.coko.foundation/kotahi/kotahi/-/blob/a3f6620a553ec3f8a6c869a75021b211019280fd/server/model-docmap/src/graphql.js) for details, or the graphql playground (typically at http://localhost:4000/graphql, when your dev environment is running).

While these queries are publicly exposed and don't need a JWT token, the `unreviewedPreprints` query expects a `token` parameter for authentication; this must match a secret token set in the `KOTAHI_API_TOKENS` environment variable in the `.env` file. Tokens may contain any characters other than commas, and may not start or end with whitespace. Multiple tokens may be stored, separated by commas. We recommend that each token contain a human-readable identifier and a strong random string, e.g.:

```
KOTAHI_API_TOKENS="Alice ZSR2YyyMFB1y55, Bob J0m7j4JfSxOtZ2, Catherine 3BV3K+1p4PRJ5A"
```

Bob's token would then be `"Bob J0m7j4JfSxOtZ2"`.

The `unreviewedPreprints` query returns an `id` and `shortId`, and the following fields if they are present in your submission form:

- `meta.title` or `submission.title` or `submission.description`
- `meta.abstract` or `submission.abstract`
- `submission.authors` (as an AuthorsInput field)
- `submission.doi`
- `submission.url` or `submission.uri` or `submission.link` or `submission.biorxivURL`

## Going further

### Manipulating the database via yarn console

If you open a terminal within your Docker **server** container, the console (`yarn console`) gives you a Node.js REPL with async/await support and models preloaded. You can access all of those as you can in the server-side code.

A few examples:

```js
// returns all manuscripts
const manuscripts = await Manuscript.query()
```

```js
// get a channels messages
const channel = await Channel.query().where({
  manuscriptId: 'someUuid',
  type: 'editorial',
})
const messages = await channel.$relatedQuery('messages')
```

And so on. For more information about the capabilities of the underlying Objection.js ORM, check out [its documentation](https://vincit.github.io/objection.js/).

### Does Kotahi support collaborative real-time text editing?

Kotahi uses the Wax editor which is not configured for real-time collaboration out of the box, but can be (and was) made to support it. It was previously configured to support it, but the feature was removed in https://gitlab.coko.foundation/kotahi/kotahi/-/merge_requests/230/diffs?commit_id=6fd9eec258ce21d4db8cf1e593bb8b891b3f3c50 due to its experimental nature and it not being required by the known workflows. Reverting that would be a good choice for a starting point, should you wish to reimplement it.

### How do I set the logo and branding colours?

`app/brandConfig.json` allows logo, colors and brand name to be specified. Colors must be specified in hex format, e.g. "#9e9e9e".

### Why are uploads not working?

We store uploads in a Docker volume. When this volume is first created (e.g. when setting up a new deployment or a new dev environment) the owner of the volume is not set correctly: the owner should be `node` but it comes out as `root`. This prevents uploading any files, including new manuscripts.

The workaround is to manually go into the server container as `root`, and change the owner of the uploads folder to `node`. This only needs to be done once; the volume will retain the correct permissions forever after. Do the following (your server name may differ from `kotahi_server_1`; run `docker ps` to list servers):

```sh
docker exec -u 0 -it kotahi_server_1 /bin/bash
chown -R node:node uploads
```

We’re looking at fixing this.

## INSTANCE_GROUPS and Multitenancy

`INSTANCE_GROUPS` is a required setting, which determines what multitenanted "groups" should run within a single instance of Kotahi. Each group has its own data, workflow, branding and other settings. You can use multiple groups to run different journals or publishing teams within a single instance of Kotahi, or to experiment with different workflows.

The `INSTANCE_GROUPS` setting in the `.env` file should contain one or more _group specifications_ separated by commas. Each _group specification_ consists of a _group name_ followed by a colon followed by a _group type_, e.g. `ourjournal:journal`. The _group name_ (before the colon) may only contain lowercase `a`-`z`, `0`-`9` and `_` characters. The _group type_ (after the colon) must be either 'journal', 'prc', 'preprint1' or 'preprint2'. (These _group types_ will be given more descriptive and generic names in future.)

Example setting for running a single group only:

```
INSTANCE_GROUPS=kotahi:journal
```

Example setting for running multiple groups:

```
INSTANCE_GROUPS=myjournal:journal,mypreprints:prc,trial_workflow:prc
```

### URLs determined by _group name_

Each group must have a different _group name_, and this _group name_ determines the URLs of the group's pages. E.g., the dashboard for a group named "myjournal" will be at `https://domain/myjournal/dashboard`. If you wish a group to have the same URLs as were used in Kotahi prior to version 2.0, you must name that group 'kotahi'.

With only a single group, the root URL `https://domain` will redirect to the frontpage `https://domain/groupname` listing recent publications, and the Login/Dashboard link. If there are multiple groups active, the root URL will be a page allowing the user to select which group they wish to navigate to; recent publications will be listed at `https://domain/groupname`, and login will be at `https://domain/groupname/login`.

### Adding or archiving groups

To add a new group, you must stop all containers, change the `INSTANCE_GROUPS` setting by adding a new _group specification_ separated by a comma, then start the containers again. The new group will be created (or revived from archive if the _group name_ matches an old, archived group) with the specified _group type_. You can then configure the group via the UI, using the Configuration Manager, Form Builders and Task Template Builder.

To archive a group you no longer wish to have active, stop all containers, remove that group's specification from `INSTANCE_GROUPS`, and restart containers.

### Upgrading from old versions

When upgrading from an earlier version of Kotahi prior to 2.0, it is recommended to specify only a single group, with the _group name_ "kotahi" and the same _group type_ as previously specified for the `INSTANCE_NAME` setting. This will keep existing settings and page URLs unchanged. See [CHANGES.md](https://gitlab.coko.foundation/kotahi/kotahi/-/blob/main/CHANGES.md#2023-07-07) for instructions. You can later change or add groups as you wish.
