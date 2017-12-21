Note: xpub is still _very_ new. This repository contains an initial set of components but is not yet ready for use.


## Contents

### PubSweet components

* `component-app`: a PubSweet component that provides an app container with nav bar and journal provider.
* `component-authentication`: a PubSweet component that provides authentication-related client pages.
* `component-dashboard`: a PubSweet component that provides a Dashboard page.
* `component-manuscript`: a PubSweet component that provides a Manuscript page.
* `component-review`: a PubSweet component that provides a Review page.
* `component-submit`: a PubSweet component that provides a Submit page.

### PubSweet applications

* `xpub-collabra`: a PubSweet application that provides configuration and routing for a journal.

### xpub packages

* `xpub-connect`: a helper component for connecting pages to data
* `xpub-edit`: WYSIWYG editors for use in xpub forms
* `xpub-journal`: a helper that provides journal config to components
* `xpub-selectors`: some useful redux selectors
* `xpub-styleguide`: components for use in react-styleguidist
* `xpub-theme`: fonts and styles for use in xpub applications
* `xpub-upload`: a helper function for file uploading
* `xpub-validators`: validator functions for use with redux-form

## Installing

In the root directory, run `yarn` to install all the dependencies.

## Configuration

To enable manuscript conversion via INK, add the following values to `packages/xpub-collabra/config/local-development.json` (ask in [the xpub channel](https://mattermost.coko.foundation/coko/channels/xpub) if you need an account):

```json
{
  "pubsweet-server": {
    "secret": "__EDIT_THIS__"
  },
  "pubsweet-component-ink-backend": {
    "inkEndpoint": "__EDIT_THIS__",
    "email": "__EDIT_THIS__",
    "password": "__EDIT_THIS__"
  }
}
```

## Running the app

1. `cd packages/xpub-collabra`
2. The first time you run the app, initialise the database with `yarn run setupdb` (press Enter when asked for a collection title, to skip that step).
3. `yarn start`

## CI

CI requires a Kubernetes cluster, resources for which can be found in `pubsweet/infra`. In order to set up a Kubernetes cluster (using AWS) you need to follow the instructions there.

## Community

Join [the Mattermost channel](https://mattermost.coko.foundation/coko/channels/xpub) for discussion of xpub.

## Roadmap

The major tasks we're planning to work on are the following: 
* Implement a future-proof theming setup.
* Let users go through multiple rounds of review.
* Implement roles and permissions.
* Change the data model to account for the changes that have occured in `pubsweet-server`, as well as to make it easily portable to Postgres in the future.
* Merge xpub's authentication, routing and navigation with pubsweet's.

You can follow more fine-grained lists of things that we're working on  
* [Collabra](https://gitlab.coko.foundation/xpub/xpub/boards?scope=all&utf8=%E2%9C%93&state=opened&milestone_title=Collabra) for tasks related to `xpub-collabra` and  
* [Xpub](https://gitlab.coko.foundation/xpub/xpub/boards?scope=all&utf8=%E2%9C%93&state=opened&milestone_title=Xpub) for more general xpub concerns
