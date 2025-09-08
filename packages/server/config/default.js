const permissions = require('./permissions')
const components = require('./components')
const journal = require('./journal')
const startupScripts = require('./startup')
const jobQueues = require('./jobHandlers')

module.exports = {
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
      {
        displayName: 'Group Admin',
        role: 'groupAdmin',
      },
    ],
  },
  permissions,
  components,
  mailer: {
    from: 'dev@example.com',
    path: `${__dirname}/mailer`, // eslint-disable-line node/no-path-concat
  },
  'publishing-webhook': {
    publishingWebhookUrl: null,
    publishingWebhookSecret: null,
    publishingWebhookRef: null,
  },
  useGraphQLServer: true,
  useFileStorage: true,
  port: 3000,
  pool: {
    min: 0,
    max: 10,
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
  jobQueues,
  tokenExpiresIn: '7 days',
}
