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

### Why is ORCID's login page not loading?

ORCID seems to be reliant on Google Tag Manager, so ad-blocker or tracker-blocker extensions in your browser may interfere with authentication.

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

| Field name                                                                                                                                               | Field type     | Purpose                                                  |
| -------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- | -------------------------------------------------------- |
| `submission.articleURL`                                                                                                                                  | TextField      | The DOI link to the article under review                 |
| `submission.review1`                                                                                                                                     | AbstractEditor | Review number 1                                          |
| `submission.review1date`                                                                                                                                 | TextField      | Review 1 date, formatted as yyyy-mm-dd or mm/dd/yyyy     |
| `submission.review1creator`                                                                                                                              | TextField      | Review 1 author, formatted as Firstname Lastname         |
`submission.review1suffix` | TextField | (Optional) Review 1 custom DOI sufix|
| `submission.review2`, `submission.review2date`, `submission.review2creator`, `submission.review2suffix`, `submission.review3`, `submission.review3date`, `submission.review3creator`, `submission.review3suffix` | As above       | (Optional) Fields for second and third reviews.          |
| `submission.summary`, `submission.summarydate`, `submission.summarycreator`, `submission.summarysuffix`                                                                              | As above       | (Optional) Fields for a summary of the reviews.          |
| `submission.description`                                                                                                                                 | TextField      | Title of the article under review, possibly abbreviated. |

### Hypothes.is

[Hypothes.is](https://web.hypothes.is) is a tool for annotating webpages and sharing those annotations. It is powered by the hypothesis browser plugin, which displays annotations (retrieved from Hypothesis's servers) when you visit an annotated webpage. It allows evaluations of articles or other data to be shared (publicly or with a select group) directly on the page where the article lives. Kotahi supports publishing most form data as Hypothesis annotations.

To enable this, you will need to first [generate a personal API token](https://h.readthedocs.io/en/latest/api/authorization/#access-tokens) for Hypothes.is, and a [group key](https://web.hypothes.is/blog/introducing-groups/) (e.g. `g4JPqbk5` if your group URL is `https://hypothes.is/groups/g4JPqbk5/my-journal-group`).

Using these keys, set the following `.env` variables:

```
HYPOTHESIS_API_KEY=<your API key here>
HYPOTHESIS_GROUP=<group key here>
HYPOTHESIS_ALLOW_TAGGING=true
```

Your submission form must also contain a field with the internal name `submission.biorxivURL` or `submission.link`, which should contain the URL of the page to be annotated.

Now you need to select which fields from your decision or submission forms can be published: in the form-builder, enable the "Include when sharing or publishing" option for each of your chosen fields (currently unavailable for SupplementaryFiles and VisualAbstract field types). If you want Hypothes.is to apply a tag to the annotation, this can be specified in the "Hypothes.is tag" text box.

Editors will still need to manually select which fields to publish for any given manuscript or research object. In the Control page, the editor will see a small "Publish" checkbox next to every field that was chosen in the form-builder (in ThreadedDiscussion fields, each comment has its own separate checkbox). They should select those they wish to publish, then hit the "Publish" button.

Each selected field or comment (if it is not empty) will be published as a separate Hypothes.is annotation. An annotation can be updated or deleted by modifying the contents of the field or deselecting the "Publish" checkbox, and pressing the "Publish" button again.

#### Ordering of published annotations

Threaded discussion comments are published first, in date order; then submission form fields (in the order they appear in the form); then decision form fields (in the order they appear in the form).

This ordering can be overridden by adding `HYPOTHESIS_REVERSE_FIELD_ORDER=true` to the `.env` file. This will not change the ordering of threaded discussion comments, but will reverse the order of all other annotations. This is occasionally useful if you wish fields to appear with a top-to-bottom ordering within the context of a bottom-to-top chronological listing (e.g. if annotations will become TRiP listings).

Note that publishing of review fields to hypothes.is is not yet supported, but is coming soon.

## API

Kotahi exposes a graphql API for external access. The available queries are:

- `manuscriptsPublishedSinceDate(startDate: DateTime, limit: Int): [PublishedManuscript]!` returns published manuscripts, with an optional startDate and/or limit.
- `publishedManuscript(id: ID!): PublishedManuscript` returns a single published manuscript by ID, or null if this manuscript is not published or not found.
- `unreviewedPreprints(token: String!): [Preprint]` returns a list of manuscripts with the `readyToEvaluate` label.

Consult [the code](https://gitlab.coko.foundation/kotahi/kotahi/blob/5b26b92d662e83061b1072afddb7fd319655a940/server/model-manuscript/src/graphql.js) for details, or the graphql playground (typically at http://localhost:4000/graphql, when your dev environment is running).

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

### Can I manually create an admin user?

Admin users can now set other users to be admins from within the dashboard. But this can also be done manually. Once you're logged in, go to the "My profile" page and copy the username (a string of digits). Open a terminal within your Docker **server** container, and perform the following, substituting your username:

```sh
yarn console
x = await User.query().where({username:"0000000210481437"}).first()
x.admin = true
x.save()
```

Now if you visit `http://localhost:4000/kotahi/admin` it should show `(admin)` below your name at the top left.

### What else can I do in the console?

If you open a terminal within your Docker **server** container, the console (`yarn console`) gives you a Node.js REPL with asyns/await support and models preloaded. You can access all of those as you can in the server-side code.

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
