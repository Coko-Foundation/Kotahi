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
published
_currentRoles @client
`

export default {
  dashboard: gql`
    {
      currentUser {
        id
        username
        admin
      }

      manuscripts {
        id
        manuscriptVersions {
          id
          parentId
          ${manuscriptFragment}
        }
        ${manuscriptFragment}
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
