const config = require('../config/shared.js')

const components = config.pubsweet.components

module.exports = {
  frontend: components.filter(component => require(component).frontend),
  backend: components.filter(component => require(component).backend)
}
