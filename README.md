# xpub-collabra  

## Quickstart

```
npm start # or docker-compose up
```

**Note**: yarn will be run automatically inside the container to install dependencies. If dependencies were already installed on the host, this may cause problems as the binaries are compiled for the wrong platform. If you encounter errors about "invalid ELF header", do `npm run clean` and then `npm start` again.

See `pubsweet-cli` for detailed documentation on running the app

## Notes

An MVP implementation of the first design sessions with [Collabra Psychology](https://www.collabra.org/), which allows a user to go through the process of creating a submission, assigning editors and reviewers, submitting reviews and submitting a decision.  

## Roadmap

The major tasks we're planning to work on are the following: 
* Implement a future-proof theming setup. (#88)
* Let users go through multiple rounds of review. (#50)
* Implement roles and permissions. (#58)
* Change the data model to account for the changes that have occured in `pubsweet-server`, as well as to make it easily portable to Postgres in the future. (#67)
* Merge xpub's authentication, routing and navigation with pubsweet's. (#55 #89 #57)

You can follow more fine-grained lists of things that we're working on  
* [Collabra](https://gitlab.coko.foundation/xpub/xpub/boards?scope=all&utf8=%E2%9C%93&state=opened&milestone_title=Collabra) for tasks related to `xpub-collabra` and  
* [Xpub](https://gitlab.coko.foundation/xpub/xpub/boards?scope=all&utf8=%E2%9C%93&state=opened&milestone_title=Xpub) for more general xpub concerns


## Contents

### PubSweet components

* `component-app`: a PubSweet component that provides an app container with nav bar and journal provider.
* `component-dashboard`: a PubSweet component that provides a Dashboard page.
* `component-manuscript`: a PubSweet component that provides a Manuscript page.
* `component-review`: a PubSweet component that provides a Review page.
* `component-submit`: a PubSweet component that provides a Submit page.

### PubSweet applications

* `xpub-collabra`: a PubSweet application that provides configuration and routing for a journal.

### xpub packages (located in pubsweet/pubsweet)

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

To enable manuscript conversion via INK, add the following values to `config/local-development.json` (ask in [the xpub channel](https://mattermost.coko.foundation/coko/channels/xpub) if you need an account):

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

1. The first time you run the app, initialise the database with `yarn run setupdb` (press Enter when asked for a collection title, to skip that step).
2. `yarn start`

## CI

CI requires a Kubernetes cluster, resources for which can be found in [`pubsweet/infra`](https://gitlab.coko.foundation/pubsweet/infra). In order to set up a Kubernetes cluster (using AWS) you need to follow the instructions there. Templates for deploying to this cluster with [`pubsweet/deployer`](https://gitlab.coko.foundation/pubsweet/deployer) are located in [`xpub/deployment-config`](https://gitlab.coko.foundation/xpub/deployment-config).

## Community

Join [the Mattermost channel](https://mattermost.coko.foundation/coko/channels/xpub) for discussion of xpub.
