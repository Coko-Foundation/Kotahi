import { gql } from '@apollo/client'

export const commentFields = `
  id
  commentType
  content
  files {
    id
    created
    updated
    name
    tags
    storedObjects {
      key
      mimetype
      url
    }
  }
`

export const reviewFields = `
  id
  created
  updated
  decisionComment {
    ${commentFields}
  }
  reviewComment {
    ${commentFields}
  }
  confidentialComment {
    ${commentFields}
  }
  isDecision
  isHiddenFromAuthor
  isHiddenReviewerName
  canBePublishedPublicly
  recommendation
  user {
    id
    defaultIdentity {
      id
      name
      identifier
    }
    username
  }
`

export const fragmentFields = `
  id
  shortId
  created
  files {
    id
    created
    updated
    name
    tags
    storedObjects {
      key
      mimetype
      url
    }
  }
  reviews {
    ${reviewFields}
  }
  teams {
    id
    role
    members {
      id
      user {
        id
        username
      }
    }
  }
  decision
  status
  meta {
    manuscriptId
    title
    source
    abstract
    declarations {
      openData
      openPeerReview
      preregistered
      previouslySubmitted
      researchNexus
      streamlinedReview
    }
    articleSections
    articleType
    history {
      type
      date
    }
    notes {
      notesType
      content
    }
    keywords
  }
  suggestions {
    reviewers {
      opposed
      suggested
    }
    editors {
      opposed
      suggested
    }
  }
  authors {
    firstName
    lastName
    email
    affiliation
  }
  submission
`

const query = gql`
  query($id: ID!) {
    currentUser {
      id
      username
      admin
    }

    manuscript(id: $id) {
      ${fragmentFields}
      manuscriptVersions {
        parentId
        ${fragmentFields}
      }
      channels {
        id
        type
        topic
      }
    }

    formForPurposeAndCategory(purpose: "submit", category: "submission") {
      structure {
        name
        description
        haspopup
        popuptitle
        popupdescription
        children {
          title
          shortDescription
          id
          component
          name
          description
          doiValidation
          placeholder
          parse
          format
          options {
            id
            label
            value
            labelColor
          }
          validate {
            id
            label
            value
          }
          validateValue {
            minChars
            maxChars
            minSize
          }
          hideFromAuthors
        }
      }
    }
  }
`

export default query
