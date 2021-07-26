import { gql } from '@apollo/client'

const manuscriptFragment = `
reviews {
  id
  open
  recommendation
  created
  isDecision
  user {
    id
    username
  }
}
teams {
  id
  role
  name
  manuscript {
    id
  }
  members {
    id
    user {
      id
      username
    }
    status
  }
}
status
meta {
  manuscriptId
  title
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
}
submission
published
_currentRoles @client
`

export const manuscriptImReviewerOfQuery = gql`
  query manuscriptsImReviewerOf {
    manuscriptsImReviewerOf {
      id
      submission
      meta {
        manuscriptId
        title
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
      }
      manuscriptVersions {
        id
        parentId
        ${manuscriptFragment}
      }
      teams {
        id
        role
        name
        manuscript {
          id
        }
        members {
          id
          user {
            id
            username
          }
          status
        }
      }
    }
  }
`

export const manuscriptImAuthorOfQuery = gql`
  query manuscriptsImAuthorOf {
    manuscriptsImAuthorOf {
      manuscriptVersions {
        id
        parentId
        ${manuscriptFragment}
      }
      id
      status
      meta {
        manuscriptId
        title
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
      }
      submission
      published
    }
  }
`

export const manuscriptImEditorOfQuery = gql`
  query manuscriptsImEditorOf {
    manuscriptsImEditorOf {
      manuscriptVersions {
        id
        parentId
        ${manuscriptFragment}
      }
      id
      created
      published
      submission
      status
      meta {
        manuscriptId
        title
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
      }
      teams {
        id
        role
        name
        manuscript {
          id
        }
        members {
          id
          user {
            id
            username
          }
          status
        }
      }
      reviews {
        id
        open
        recommendation
        created
        isDecision
        user {
          id
          username
        }
      }
      currentRoles
    }
  }
`

// currentRoles
// reviews
// submission

export default {
  dashboard: gql`
    {
      currentUser {
        id
        username
        admin
      }
    }
  `,
  getUser: gql`
    query GetUser($id: ID!) {
      user(id: $id) {
        id
        username
        admin
        teams {
          id
        }
      }
    }
  `,
}
