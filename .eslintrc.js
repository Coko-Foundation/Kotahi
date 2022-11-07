const { eslint } = require('@coko/lint')

// Added parserOptions to remove the @decorators issues
eslint.parserOptions = {
  ecmaVersion: 6,
  ecmaFeatures: {
    legacyDecorators: true,
    experimentalObjectRestSpread: true,
  },
}
eslint.rules['react/jsx-props-no-spreading'] = 0

module.exports = eslint
