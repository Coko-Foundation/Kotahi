import { gql } from '@apollo/client'

const reviewFields = `
  id
  created
  updated
  jsonData
  isDecision
  isHiddenFromAuthor
  isCollaborative
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

// eslint-disable-next-line import/prefer-default-export
export const reviewFormUpdatedSubscription = gql`
  subscription ReviewFormUpdated($formId: ID!) {
    reviewFormUpdated(formId: $formId) {
      ${reviewFields}
    }
  }
`
