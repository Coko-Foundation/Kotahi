const path = require('path')

// paths that use ES6 scripts and CSS modules
// TODO: compile components to ES5 for distribution

module.exports = [
  path.join(__dirname, '..', 'app'),
  /pubsweet-[^/]+\/src/,
  /xpub-[^/]+\/src/,
  /component-[^/]+\/src/,
  /wax-[^/]+\/src/,
  /@pubsweet\/[^/]+\/src/,
]
