# FAQ

## All I see is a "Recent publications" page with no publications. How do I login?

Go to `/login` on your browser.
eg. if your app is at `kotahi.myorg.com`, go to `kotahi.myorg.com/login`

## How do I setup ORCID for development?

Getting past the login screen can be a challenge if you haven't set this up correctly. You need two things: an account at `sandbox.orcid.org` and a `mailinator` email. When `NODE_ENV` is set to `development`, the app will expect you to be using a sandbox account. ORCID's sandbox in turn will only send emails to mailinator accounts, so if you don't use mailinator, you won't be able to verify your email (and consequently not be able to set this up).

So here's how to set this up in less than 20 easy steps:

1. Go to [mailinator.com](mailinator.com)
2. In the search bar at the top of the page enter your desired username (we'll use `mycokotestemail` for this guide) and click "GO". (tip: choose a username that is unlikely to be used already by someone else)
3. You'll be taken to a new page. This is your inbox for `mycokotestemail@mailinator.com`. Keep this page open. (also keep in mind that this is a fully **public** inbox)
4. Go to [sandbox.orcid.org](sandbox.orcid.org)
5. Click on "SIGN IN/REGISTER", then on "register now"
6. Fill out the form. In the email field use your newly created mailinator email.
7. Fill out the rest of the form until you register.
8. You'll be taken to your dashboard. Click on your name at the top right, then "Developer Tools".
9. Click on the "Verify your email address to get started" button.
10. Go to your mailinator inbox. Open the email you received from orcid and click on the "Verify your email address" button.
11. Go back to your developer tools section in ORCID. Click on "Register for the free ORCID public API", check the consent box and click on "Continue".
12. You should now be presented with a form. Fill in your application's name, website and description. What you put in these fields shouldn't matter, as this will only be used for development. (tip: if you get an error that your website's URL is invalid, try something generic and include the protocol - eg. `http://www.google.com`)
13. Under "Redirect URIs", add the url of your kotahi client plus `/auth/orcid/callback`. So if in your browser you can see your app under `http://localhost:4000`, the value here should be `http://localhost:4000/auth/orcid/callback`. [1]
14. Click on the floating save icon on the right.
15. You should now be presented with a gray box that gives you a client id and a client secret.
16. Go to your application's environment file and enter the values you just got.

```sh
export ORCID_CLIENT_ID=your-orcid-client-id
export ORCID_CLIENT_SECRET=your-orcid-client-secret
```

17. Source your environment file to your shell and start the app.

You should now be able to use the login.

_Disclaimer: ORCID is a separate organisation from Coko and we are in no way affiliated with them. This is meant as a guide to make a developer's life easier. If you encounter issues with ORCID services not working as expected, please contact their support._

[1] Even though this URL does not exist for the client (ie. it isn't handled by our `react-router` setup), it will be redirected to the server via `webpack-dev-server`'s proxy.

## Why is ORCID's login page not loading?

ORCID seems to be reliant on Google Tag Manager, so ad-blocker or tracker-blocker extensions in your browser may interfere with authentication.

## How can I create an admin user?

Once you're logged in, go to the "My profile" page and copy the username (a string of digits). Open a terminal within your Docker **server** container, and perform the following, substituting your username:

```sh
yarn console
x = await User.query().where({username:"0000000210481437"}).first()
x.admin = true
x.save()
```

# What else can I do in the console?

The console (`yarn console`) gives you a Node.js REPL with asyns/await support and models preloaded. You can access all of those as you can in the server-side code.

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

## What should PUBLIC_CLIENT_HOST be set to?

This environment variable is currently only needed when deploying a _development_ build to a server (not to localhost). Set it to the server's name, e.g. `subdomain.myserver.com`.

# What if I want to use my own PostgreSQL instance (i.e. not via `docker-compose`)?

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

# Does Kotahi support collaborative real-time text editing?

Kotahi uses the Wax editor which is not configured for real-time collaboration out of the box, but can be (and was) made to support it. It was previously configured to support it, but the feature was removed in https://gitlab.coko.foundation/kotahi/kotahi/-/merge_requests/230/diffs?commit_id=6fd9eec258ce21d4db8cf1e593bb8b891b3f3c50 due to its experimental nature and it not being required by the known workflows. Reverting that would be a good choice for a starting point, should you wish to reimplement it.
