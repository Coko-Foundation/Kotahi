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
  validations: path.resolve(__dirname, 'validations.js'),
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
    // path: path.resolve(__dirname, formTemplatePath[process.env.INSTANCE_NAME]),
    path: deferConfig(cfg => {
      const formTemplatePath = {
        elife: '../app/storage/forms',
        aperture: '../app/storage/forms-aperture',
        ncrc: '../app/storage/forms-ncrc',
        colab: '../app/storage/forms-colab',
      }

      const pathToFormTemplateFolder =
        formTemplatePath[String(process.env.INSTANCE_NAME)]

      return path.resolve(__dirname, pathToFormTemplateFolder)
    }),
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
    typeDefs: `
      extend type User {
        name: String
      }

      extend type Team {
        group: String
      }

      # extend type Collection {
      #   collectionType: String
      #   created: String
      #   title: String
      #   status: String
      #   reviewers: [CollectionReviewer]
      # }

      type CollectionReviewer {
        id: String!
        user: String!
      }

      # extend type Fragment {
      #   created: String
      #   version: Int
      #   submitted: String
      #   source: String
      #   metadata: VersionMetadata
      #   declarations: VersionDeclaration
      #   suggestions: VersionSuggestionGroup
      #   files: VersionFileGroup
      #   notes: VersionNotes
      #   reviewers: [ReviewerMeta]
      #   # TODO
      #   #lock: VersionLock
      #   #decision: VersionDecision
      # }

      type VersionMetadata {
        title: String
        abstract: String
        articleType: String
        articleSection: [String]
        authors: [String]
        keywords: [String]
      }
      type VersionDeclaration {
        #TODO make these boolean?
        openData: String
        previouslySubmitted: String
        openPeerReview: String
        streamlinedReview: String
        researchNexus: String
        preregistered: String
      }
      type VersionSuggestionGroup {
        reviewers: VersionSuggestions
        editors: VersionSuggestions
      }
      type VersionSuggestions {
        suggested: [String]
        opposed: [String]
      }
      type VersionFileGroup {
        manuscript: VersionFile
        supplementary: [VersionFile]
      }
      type VersionFile {
        name: String!
        type: String
        size: Int
        url: String
      }
      type VersionNotes {
        fundingAcknowledgement: String
        specialInstructions: String
      }
      type ReviewerMeta {
        id: String
        reviewer: String
        status: String
        _reviewer: CollectionReviewer
        _user: User
      }
    `,
  },
  'pubsweet-client': {
    API_ENDPOINT: '/api',
    'login-redirect': `${journal.metadata.toplevel_urlfragment}/dashboard`,
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
      'text/x-tex',
      'application/pdf',
      'application/epub+zip',
      'application/zip',
    ],
  },
  pagedjs: {
    clientId: '',
    clientSecret: '',
    protocol: '',
    host: '',
    port: '',
  },
  /** These named configuration sections will be available to webpack */
  publicKeys: [
    'pubsweet-client',
    'validations',
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
    autoImportHourUtc: '',
    archivePeriodDays: '',
    allowManualImport: 'false',
    semanticScholarImportsRecencyPeriodDays: 42,
  },
}
