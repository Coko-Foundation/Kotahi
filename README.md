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

|Module             |Description                                    |In progress    |Issue
|:---:              |---                                            |:---:          |
|System             |Apply Coko theme                               |&#x2714;       |#154
|System             |Implement roles & permissions                  |&#x2714;       |#58
|System             |Revisit data model                             |               |#67
|Dashboard          |Change text for new submission button          |               |#156
|Dashboard          |Provide feedback while ingesting docs          |               |#157
|Dashboard          |Click on title to go to control panel          |               |#158
|Dashboard          |Add streamlined review to displayed metadata   |               |#159
|Dashboard          |Update text of manuscript statuses             |               |#112
|Summary Info       |Reduce minimum title length                    |               |#164
|Summary Info       |Update text for metadata questions             |               |#165
|Summary Info       |Display decision letter                        |               |#166
|Manuscript         |Link to Summary Info for this manuscript       |               |#114
|Assign Reviewers   |Reviewer invitation email                      |               |#160
|Assign Reviewers   |Link back to Control Panel                     |               |#155
|Review             |Update label text                              |               |#161
|Control Panel      |Update decision placeholder text               |               |#163
|Control Panel      |Show more complete set of metadata             |               |#131

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
