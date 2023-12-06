const path = require('path')
const logger = require('winston')
const { deferConfig } = require('config/defer')

const permissions = require('./permissions')
const components = require('./components.json')
const journal = require('./journal')

module.exports = {
  teams: {
    seniorEditor: {
      name: 'Senior Editor',
    },
    handlingEditor: {
      name: 'Handling Editor',
    },
    editor: {
      name: 'Editor',
    },
    managingEditor: {
      name: 'Managing Editor',
    },
    reviewer: {
      name: 'Reviewer',
    },
    author: {
      name: 'Author',
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
    path: `${__dirname}/mailer`,
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
    serveClient: true,
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
    logger,
    uploads: 'uploads',
    baseUrl: deferConfig(cfg => {
      const { protocol, host, port } = cfg['pubsweet-server']
      return `${protocol}://${host}${port ? `:${port}` : ''}`
    }),
  },
  'pubsweet-client': {
    API_ENDPOINT: '/api',
    theme: process.env.PUBSWEET_THEME,
    baseUrl: deferConfig(cfg => {
      const {
        publicProtocol,
        protocol,
        publicHost,
        host,
        publicPort,
        port,
      } = cfg['pubsweet-client']

      const protocolToUse = publicProtocol || protocol
      let hostToUse = publicHost || host || 'localhost'
      if (hostToUse === '0.0.0.0') hostToUse = 'localhost'
      const portToUse = publicPort || port
      return `${protocolToUse}://${hostToUse}${
        portToUse ? `:${portToUse}` : ''
      }`
    }),
  },
  'pubsweet-component-xpub-dashboard': {
    acceptUploadFiles: [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/x-latex',
      'text/vnd.latex-z',
      'text/plain',
      'text/x-tex',
      'application/x-tex',
      'application/x-dvi',
      'application/pdf',
      'application/epub+zip',
      'application/zip',
      '.tex',
    ],
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
  /** These named configuration sections will be available to webpack */
  publicKeys: [
    'pubsweet-client',
    'pubsweet-component-xpub-dashboard',
    'pubsweet-component-xpub-formbuilder',
    'pubsweet',
    'detectionMethodCorrelations',
    'journal',
    'teams',
    'client-features',
    'crossref',
    'hypothesis',
    'review',
    'notification-email',
    'pagedjs',
    'manuscripts',
  ],
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
}
