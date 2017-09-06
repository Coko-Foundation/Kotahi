const path = require('path')

module.exports = {
  symlinks: false, // needed so that babel doesn't look for plugins in components
  modules: [
    path.resolve(__dirname, '..'), // needed for resolving app/routes
    path.resolve(__dirname, '../node_modules'),
    path.resolve(__dirname, '../../../node_modules'),
    'node_modules'
  ],
  alias: {
    joi: 'joi-browser'
  },
  extensions: ['.js', '.jsx'],
}
