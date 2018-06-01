const path = require('path')
const components = require('./components.json')
const logger = require('winston')

module.exports = {
  authsome: {
    mode: path.resolve(__dirname, 'authsome.js'),
    teams: {
      seniorEditor: {
        name: 'Senior Editors',
      },
      handlingEditor: {
        name: 'Handling Editors',
      },
      managingEditor: {
        name: 'Managing Editors',
      },
      reviewer: {
        name: 'Reviewer',
      },
    },
  },
  validations: path.resolve(__dirname, 'validations.js'),
  pubsweet: {
    components,
  },
  mailer: {
    from: 'dev@example.com',
    path: `${__dirname}/mailer`,
  },
  'pubsweet-server': {
    db: {},
    port: 3000,
    logger,
    uploads: 'uploads',
    typeDefs: `
      extend type User {
        name: String
      }

      extend type Team {
        group: String
      }

      extend type Collection {
        collectionType: String
        created: String
        title: String
        status: String
        reviewers: [CollectionReviewer]
      }

      type CollectionReviewer {
        id: String!
        user: String!
      }

      extend type Fragment {
        created: String
        version: Int
        submitted: String
        source: String
        metadata: VersionMetadata
        declarations: VersionDeclaration
        suggestions: VersionSuggestionGroup
        files: VersionFileGroup
        notes: VersionNotes
        reviewers: [ReviewerMeta]
        # TODO
        #lock: VersionLock
        #decision: VersionDecision
      }
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
    'login-redirect': '/',
    'redux-log': false,
    theme: process.env.PUBSWEET_THEME,
  },
  'password-reset': {
    url:
      process.env.PUBSWEET_PASSWORD_RESET_URL ||
      'http://localhost:3000/password-reset',
    sender: process.env.PUBSWEET_PASSWORD_RESET_SENDER || 'dev@example.com',
  },
  'pubsweet-component-ink-backend': {
    inkEndpoint:
      process.env.INK_ENDPOINT || 'http://inkdemo-api.coko.foundation/',
    email: process.env.INK_USERNAME,
    password: process.env.INK_PASSWORD,
    maxRetries: 500,
    recipes: {
      'editoria-typescript': '2',
    },
  },
  publicKeys: ['pubsweet-client', 'authsome', 'validations'],
}
