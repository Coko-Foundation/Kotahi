import { gql } from '@apollo/client'

export const reviewFields = `
  id
  created
  updated
  jsonData
  isDecision
  isHiddenFromAuthor
  isHiddenReviewerName
  canBePublishedPublicly
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

const formFields = `
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
      extension
      key
      mimetype
      size
      type
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

    submissionForm: formForPurposeAndCategory(purpose: "submit", category: "submission") {
      ${formFields}
    }

    decisionForm: formForPurposeAndCategory(purpose: "decision", category: "decision") {
      ${formFields}
    }

    reviewForm: formForPurposeAndCategory(purpose: "review", category: "review") {
      ${formFields}
    }
  }
`

export default query
