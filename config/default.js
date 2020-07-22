const path = require('path')
const components = require('./components.json')
const logger = require('winston')

module.exports = {
  authsome: {
    mode: path.resolve(__dirname, 'authsome.js'),
    teams: {
      seniorEditor: {
        name: 'Senior Editors',
        permissions: '',
      },
      handlingEditor: {
        name: 'Handling Editors',
        permissions: '',
      },
      managingEditor: {
        name: 'Managing Editors',
        permissions: '',
      },
      reviewer: {
        name: 'Reviewer',
        permissions: '',
      },
      author: {
        name: 'Authors',
        permissions: '',
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
  'pubsweet-component-xpub-formbuilder': {
    path: path.resolve(__dirname, '../app/storage/forms'),
    components: require(path.resolve(__dirname, 'form-components.json')),
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
    'login-redirect': '/journal/dashboard',
    theme: process.env.PUBSWEET_THEME,
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
    'authsome',
    'validations',
    'pubsweet-component-xpub-dashboard',
    'pubsweet-component-xpub-formbuilder',
    'pubsweet',
    'detectionMethodCorrelations',
    'journal',
  ],
  schema: {},
  journal: require('./journal'),
}
