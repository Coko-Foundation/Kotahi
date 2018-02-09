const path = require('path')

// paths that use ES6 scripts and CSS modules
// TODO: compile components to ES5 for distribution

module.exports = [
  // include app folder
  path.join(__dirname, '..', 'app'),
  // include pubsweet and xpub packages which are published untranspiled
  /xpub-[^/]+\/src/,
  /component-[^/]+\/src/,
  /wax-[^/]+\/src/,
  /pubsweet-[^/\\]+\/(?!node_modules)/,
  /@pubsweet\/[^/\\]+\/(?!node_modules)/,
  // include other packages when this repo is mounted in a workspace
  /packages\/[^/\\]+\/(?!node_modules)/,
]
