const { isEnvVariableTrue } = require('@coko/server/src/utils/env')
const modelComponents = require('../models/modelComponents')

const components = [
  ...modelComponents,
  './api/graphql',
  './api/rest/assetUpload',

  './server/model-notification/src/',
  './server/model-team/src',
  './server/model-user/src',
  './server/model-cms/src',
  './server/model-article-import-sources/src/',
  './server/model-article-import-history/src/',
  './server/model-manuscript/src/',
  './server/model-invitations/src/',
  './server/model-file/src/',
  './server/model-review/src/',
  './server/model-form/src/',
  '@pubsweet/job-xsweet',
  './server/model-channel/src',
  './server/model-message/src',
  './server/reports/src',
  './server/coar-notify',
  './server/profile-upload',
  './server/auth-orcid',
  '@coko/server/src/models/file',
  './server/pdfexport',
  './server/jatsexport',
  './server/model-threaded-discussion/src/',
  './server/model-task/src',
  './server/model-published-artifact/src',
  './server/model-docmap/src',
  './server/config/src',
  './server/xsweet',
  './server/model-email-templates/src',
  './server/flax-site',
  './server/model-group/src',
  './server/reference/src',
  './server/model-article-templates/src',
  './server/cms-upload',
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
