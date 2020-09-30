const models = require('@pubsweet/models')

Object.keys(models).forEach(key => (global[key] = models[key]))
