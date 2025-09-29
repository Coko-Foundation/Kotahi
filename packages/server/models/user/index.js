const { defaultIdentitiesLoader } = require('./user.loaders')
const model = require('./user.model')

module.exports = {
  model,
  modelName: 'User',
  modelLoaders: {
    defaultIdentitiesLoader,
  },
}
