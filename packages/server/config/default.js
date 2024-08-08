const path = require('path')

const permissions = require('./permissions')
const components = require('./components')
const journal = require('./journal')

// console.log('helloooooooo')

// Object.keys(process.env)
//   .filter(k =>
//     [
//       'POSTGRES_PORT',
//       'POSTGRES_HOST',
//       'POSTGRES_DB',
//       'POSTGRES_USER',
//       'POSTGRES_PASSWORD',
//     ].includes(k),
//   )
//   .map(i => {
//     console.log(`${k}: ${process.env[k]}`)
//   })

module.exports = {
  teams: {
    global: {
      admin: {
        displayName: 'Admin',
        role: 'admin',
      },
      groupManager: {
        displayName: 'Group Manager',
        role: 'groupManager',
      },
    },
    nonGlobal: {
      seniorEditor: {
        displayName: 'Senior Editor',
        role: 'seniorEditor',
      },
      handlingEditor: {
        displayName: 'Handling Editor',
        role: 'handlingEditor',
      },
      editor: {
        displayName: 'Editor',
        role: 'editor',
      },
      managingEditor: {
        displayName: 'Managing Editor',
        role: 'managingEditor',
      },
      reviewer: {
        displayName: 'Reviewer',
        role: 'reviewer',
      },
      author: {
        displayName: 'Author',
        role: 'author',
      },
      collaborativeReviewer: {
        displayName: 'Collaborative Reviewer',
        role: 'collaborativeReviewer',
      },
    },
  },
  authsome: {
    mode: path.resolve(__dirname, 'authsome.js'),
  },
  permissions,
  pubsweet: {
    components,
  },
  mailer: {
    from: 'dev@example.com',
    path: `${__dirname}/mailer`, // eslint-disable-line node/no-path-concat
  },
  'client-features': {
    displayShortIdAsIdentifier: 'false',
  },
  'publishing-webhook': {
    publishingWebhookUrl: null,
    publishingWebhookSecret: null,
    publishingWebhookRef: null,
  },
  'pubsweet-component-xpub-formbuilder': {
    // TODO: remove as this path is only used in a formbuilder page unit test
    // path: path.resolve(__dirname, formTemplatePath[process.env.INSTANCE_NAME]),
    // path: deferConfig(cfg => {
    //   const formTemplatePath = {
    //     preprint1: '../app/storage/forms',
    //     journal: '../app/storage/forms-journal',
    //     preprint2: '../app/storage/forms-preprint2',
    //     prc: '../app/storage/forms-prc',
    //   }
    //   const pathToFormTemplateFolder =
    //     formTemplatePath[String(process.env.INSTANCE_NAME)]
    //   return path.resolve(__dirname, pathToFormTemplateFolder)
    // }),
  },
  'pubsweet-server': {
    useGraphQLServer: true,
    useJobQueue: false,
    useFileStorage: true,
    db: {},
    port: 3000,
    pool: {
      min: 0,
      max: 300,
      createTimeoutMillis: 3000,
      acquireTimeoutMillis: 30000,
      idleTimeoutMillis: 30000,
      reapIntervalMillis: 1000,
      createRetryIntervalMillis: 100,
      propagateCreateError: false,
    },
    uploads: 'uploads',
    wsYjsServerPort: '5010',
  },
  pagedjs: {
    clientId: '',
    clientSecret: '',
    protocol: '',
    host: '',
    port: '',
  },
  anystyle: {
    protocol: '',
    host: '',
    port: '',
  },
  xsweet: {
    clientId: '',
    clientSecret: '',
    protocol: '',
    host: '',
    port: '',
  },
  crossref: {
    login: '',
    password: '',
    registrant: '',
    depositorName: '',
    depositorEmail: '',
    doiPrefix: '',
  },
  hypothesis: {
    apiKey: '',
    group: '__world__',
  },
  schema: {},
  journal,
  review: {
    shared: '',
    hide: '',
  },
  'notification-email': {
    automated: 'false',
    cc_enabled: 'false',
    use_colab: 'false',
  },
  fileStorage: {
    minioRootUser: '',
    minioRootPassword: '',
    accessKeyId: '',
    secretAccessKey: '',
    bucket: '',
    protocol: '',
    host: '',
    port: '',
    minioConsolePort: '',
    maximumWidthForSmallImages: '',
    maximumWidthForMediumImages: '',
  },
  manuscripts: {
    teamTimezone: 'Etc/UTC',
    autoImportHourUtc: '',
    archivePeriodDays: '',
    allowManualImport: 'false',
    semanticScholarImportsRecencyPeriodDays: '42',
  },
  'flax-site': {
    clientId: '',
    clientSecret: '',
    clientAPIURL: '',
    clientFlaxSiteUrl: '',
    port: '',
    host: '',
    protocol: '',
  },
  'import-for-prc': {
    default_import: 'false',
  },
  chatGPT: {
    key: 'CHAT_GPT_KEY',
  },
}
