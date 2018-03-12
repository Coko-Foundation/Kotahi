const path = require('path')

// paths that use ES6 scripts and CSS modules
// TODO: compile components to ES5 for distribution

module.exports = [
  // include app folder
  path.join(__dirname, '..', 'app'),
  // include pubsweet and xpub packages which are published untranspiled
  /xpub-[^/]+\/src/,
  /wax-[^/]+\/src/,
  /pubsweet-[^/\\]+\/(?!node_modules)/,
  /@pubsweet\/[^/\\]+\/(?!node_modules)/,
  // include pubsweet packages when npm linked from monorepo
  filepath =>
    // is a child of packages but not node_modules
    filepath.match(/\/packages\//) && !filepath.match(/\/node_modules\//),
]
