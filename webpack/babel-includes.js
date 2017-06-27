const path = require('path')

module.exports = [
  new RegExp(path.join(__dirname, '../node_modules/pubsweet-client/src')),
  new RegExp(path.join(__dirname, '../app')),
  new RegExp(path.join(__dirname, '../node_modules/pubsweet-[^/]*(?!.*/node_modules)'))
]
