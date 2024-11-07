const permissions = require('./permissions')
const components = require('./components')
const journal = require('./journal')
const startupScripts = require('./startup')

const cfg = {
  teams: {
    global: [
      {
        displayName: 'Admin',
        role: 'admin',
      },
      {
        displayName: 'Group Manager',
        role: 'groupManager',
      },
    ],
    nonGlobal: [
      {
        displayName: 'Senior Editor',
        role: 'seniorEditor',
      },
      {
        displayName: 'Handling Editor',
        role: 'handlingEditor',
      },
      {
        displayName: 'Editor',
        role: 'editor',
      },
      {
        displayName: 'Managing Editor',
        role: 'managingEditor',
      },
      {
        displayName: 'Reviewers',
        role: 'reviewer',
      },
      {
        displayName: 'Author',
        role: 'author',
      },
      {
        displayName: 'Collaborative Reviewers',
        role: 'collaborativeReviewer',
      },
      {
        displayName: 'User',
        role: 'user',
      },
      {
        displayName: 'Group Manager',
        role: 'groupManager',
      },
    ],
  },
  permissions,
  components,
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
  useGraphQLServer: true,
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
  wsYjsServerPort: '5010',
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
    accessKeyId: '',
    secretAccessKey: '',
    bucket: '',
    url: '',
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
  onStartup: startupScripts,
  staticFolders: [
    {
      folderPath: './profiles',
      mountPoint: '/profiles',
    },
  ],
}

if (process.env.POSTGRES_ALLOW_SELF_SIGNED_CERTIFICATES) {
  if (!cfg.db.ssl) cfg.db.ssl = {}
  cfg.db.ssl.rejectUnauthorized = false
}

if (process.env.POSTGRES_CA_CERT) {
  if (!cfg.db.ssl) cfg.db.ssl = {}

  cfg.db.ssl.ca = Buffer.from(process.env.POSTGRES_CA_CERT, 'base64').toString(
    'utf-8',
  )
}

module.exports = cfg
