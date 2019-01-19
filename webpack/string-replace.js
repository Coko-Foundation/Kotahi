// replace "PUBSWEET_COMPONENTS" string in pubsweet-client
const path = require('path')
const components = require('../config/components.json')
const include = require('./babel-includes')

const requireComponentsString = components
  .filter(name => {
    let component
    try {
      component = require(name)
    } catch (error) {
      component = require(path.join(__dirname, '..', name))
    }
    // "client" or "frontend" for backwards compatibility
    return component.client || component.frontend
  })
  .map(name => `require('${name}')`)
  .join(', ')

module.exports = {
  test: /\.js$|\.jsx$/,
  enforce: 'pre',
  include,
  loader: 'string-replace-loader',
  options: {
    search: 'PUBSWEET_COMPONENTS',
    replace: `[${requireComponentsString}]`,
  },
}
