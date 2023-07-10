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
    profilePicture
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
      doiUniqueSuffixValidation
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
      permitPublishing
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
    objectId
    objectType
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
    history {
      type
      date
    }
  }
  authors {
    firstName
    lastName
    email
    affiliation
  }
  submission
  formFieldsToPublish {
    objectId
    fieldsToPublish
  }
`

const query = gql`
  query($id: ID!, $groupId: ID) {
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

    submissionForm: formForPurposeAndCategory(purpose: "submit", category: "submission", groupId: $groupId) {
      ${formFields}
    }

    decisionForm: formForPurposeAndCategory(purpose: "decision", category: "decision", groupId: $groupId) {
      ${formFields}
    }

    reviewForm: formForPurposeAndCategory(purpose: "review", category: "review", groupId: $groupId) {
      ${formFields}
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
          manuscriptVersionId
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
  }
`

export default query
