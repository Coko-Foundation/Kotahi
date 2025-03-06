const { isEnvVariableTrue } = require('@coko/server/src/utils/env')
const modelComponents = require('../models/modelComponents')

const components = [
  '@coko/server/src/models/team',
  '@coko/server/src/models/teamMember',
  '@coko/server/src/models/file',
  ...modelComponents,

  './api/graphql',

  './api/rest/assetUpload',
  './api/rest/coar',
  './api/rest/cmsUpload',
  './api/rest/orcid',
  './api/rest/profileUpload',

  './server/model-user/src',
  './server/model-invitations/src/',
  './server/model-review/src/',
  './server/model-message/src',
  './server/reports/src',
  './server/jatsexport',
  './server/reference/src',
  './server/model-publishing-collection/src',
]

if (
  process.env !== 'production' &&
  isEnvVariableTrue(process.env.E2E_TESTING_API)
) {
  console.warn(
    '\n>>>>> IMPORTANT! Using E2E_TESTING_API should never be done on production deployments!\n',
  )

  components.push('./api/rest/e2e')
}

module.exports = components
