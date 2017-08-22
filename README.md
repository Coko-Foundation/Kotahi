Note: xpub is still _very_ new. This repository contains an initial set of components but is not yet ready for use.

## Installing

In the root directory, run `npm install` then `npm run bootstrap` to install all the dependencies.

Note: this monorepo uses Lerna, which works best with npm v4 when linking unpublished packages. Hoisting is not yet reliable, so each component has its own node_modules folder.

## Contents

### PubSweet components

* `component-app`: a PubSweet component that provides an app container with nav bar.
* `component-authentication`: a PubSweet component that provides authentication-related client pages.
* `component-dashboard`: a PubSweet component that provides a Dashboard page.
* `component-submit`: a PubSweet component that provides a Submit page.
* `component-manuscript`: a PubSweet component that provides a Manuscript page.

## PubSweet applications

* `xpub-collabra`: a PubSweet application that provides configuration and routing for a journal.

## xpub packages

* `xpub-fonts`: fonts for use in xpub applications
* `xpub-selectors`: some useful redux selectors
* `xpub-ui`: a library of user interface elements for use in PubSweet components.

