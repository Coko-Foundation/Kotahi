import { gql } from '@apollo/client'

const reviewFields = `
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
    username
    profilePicture
    defaultIdentity {
      id
      identifier
    }
  }
`

const manuscriptFields = `
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
    objectId
    objectType
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
  formFieldsToPublish {
    objectId
    fieldsToPublish
  }
  tasks {
    id
    created
    updated
    manuscriptId
    title
    assigneeUserId
    assignee {
      id
      username
      email
      profilePicture
    }
    defaultDurationDays
    dueDate
    reminderPeriodDays
    status
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
      permitPublishing
      parse
      format
      options {
        id
        label
        labelColor
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
`

export const query = gql`
  query($id: ID!) {
    currentUser {
      id
      username
      admin
    }

    manuscript(id: $id) {
      ${manuscriptFields}
      manuscriptVersions {
        ${manuscriptFields}
      }
      channels {
        id
        type
        topic
      }
    }

    threadedDiscussions(manuscriptId: $id) {
      id
      created
      updated
      manuscriptId
      threads {
        id
        comments {
          id
          commentVersions {
            id
            author {
              id
              username
              profilePicture
            }
            comment
            created
          }
          pendingVersion {
            author {
              id
              username
              profilePicture
            }
            comment
          }
        }
      }
      userCanAddComment
      userCanEditOwnComment
      userCanEditAnyComment
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
      ${manuscriptFields}
    }
  }
`
export const createThreadMutation = gql`
  mutation($id: ID!, $decision: String) {
    createThread(id: $id, decision: $decision) {
      id
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

export const setShouldPublishFieldMutation = gql`
  mutation($manuscriptId: ID!, $objectId: ID!, $fieldName: String!, $shouldPublish: Boolean!) {
    setShouldPublishField(
      manuscriptId: $manuscriptId
      objectId: $objectId
      fieldName: $fieldName
      shouldPublish: $shouldPublish
    ) {
      ${manuscriptFields}
    }
  }
`
