/* eslint-disable global-require */

module.exports = {
  ...require('./graphql'),
  modelName: 'CMSPage',
  models: [
    { modelName: 'CMSPage', model: require('./cmsPage') },
    { modelName: 'CMSLayout', model: require('./cmsLayout') },
    { modelName: 'CMSFileTemplate', model: require('./cmsFileTemplate') },
  ],
}
