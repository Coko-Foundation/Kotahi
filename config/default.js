const path = require('path')
const logger = require('winston')
const { deferConfig } = require('config/defer')

const components = require('./components.json')
const formComponents = require('./form-components.json')
const journal = require('./journal')

module.exports = {
  teams: {
    seniorEditor: {
      name: 'Senior Editor',
    },
    handlingEditor: {
      name: 'Handling Editor',
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
  validations: path.resolve(__dirname, 'validations.js'),
  pubsweet: {
    components,
  },
  mailer: {
    from: 'dev@example.com',
    path: `${__dirname}/mailer`,
  },
  'pubsweet-component-xpub-formbuilder': {
    // path: path.resolve(__dirname, formTemplatePath[process.env.INSTANCE_NAME]),
    path: deferConfig(cfg => {
      const formTemplatePath = {
        http: '../app/storage/forms',
        https: '../app/storage/forms-coko',
      }

      const pathToFormTemplateFolder =
        formTemplatePath[process.env.CLIENT_PROTOCOL]

      return path.resolve(__dirname, pathToFormTemplateFolder)
    }),
    components: formComponents,
  },
  'pubsweet-server': {
    db: {},
    port: 3000,
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
        ORCID_AUTH_REDIRECT_PORT,
        ORCID_AUTH_REDIRECT_HOSTNAME,
        ORCID_AUTH_REDIRECT_PROTOCOL,
      } = process.env

      return `${ORCID_AUTH_REDIRECT_PROTOCOL}://${ORCID_AUTH_REDIRECT_HOSTNAME}:${ORCID_AUTH_REDIRECT_PORT}`
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
  publicKeys: [
    'pubsweet-client',
    'validations',
    'pubsweet-component-xpub-dashboard',
    'pubsweet-component-xpub-formbuilder',
    'pubsweet',
    'detectionMethodCorrelations',
    'journal',
    'teams',
  ],
  schema: {},
  journal,
}
