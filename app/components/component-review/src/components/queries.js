import { gql } from '@apollo/client'

const commentFields = `
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

const reviewFields = `
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
    username
    profilePicture
    defaultIdentity {
      id
      identifier
    }
  }
`

const fragmentFields = `
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
  decision
  teams {
    id
    name
    role
    manuscript {
      id
    }
    members {
      id
      user {
        id
        username
        defaultIdentity {
          id
          name
        }
      }
      status
    }
  }
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
  submission
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
  published
`

export const query = gql`
  query($id: ID!) {
    currentUser {
      id
      username
      admin
    }

    manuscript(id: $id) {
      ${fragmentFields}
      manuscriptVersions {
        ${fragmentFields}
      }
      channels {
        id
        type
        topic
      }
    }

    formForPurpose(purpose: "submit") {
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
          includeInReviewerPreview
          parse
          format
          options {
            id
            label
            value
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
        }
      }
    }
    
    users {
      id
      username
      email
      admin
      defaultIdentity {
        id
      }
    }
  }
`

export const updateReviewMutation = gql`
  mutation($id: ID, $input: ReviewInput) {
    updateReview(id: $id, input: $input) {
      ${reviewFields}
    }
  }
`

export const makeDecisionMutation = gql`
  mutation($id: ID!, $decision: String) {
    makeDecision(id: $id, decision: $decision) {
      id
      ${fragmentFields}
    }
  }
`

export const publishManuscriptMutation = gql`
  mutation($id: ID!) {
    publishManuscript(id: $id) {
      manuscript {
        id
        published
        status
      }
      steps {
        stepLabel
        succeeded
        errorMessage
      }
    }
  }
`

export const sharedReviews = gql`
  query($id: ID) {
    sharedReviews(id: $id) {
      ${reviewFields}
    }
  }
`

export const getUsers = gql`
  {
    users {
      id
      username
      email
      admin
      defaultIdentity {
        id
      }
    }
  }
`

export const sendEmail = gql`
  mutation($input: String) {
    sendEmail(input: $input) {
      success
    }
  }
`
