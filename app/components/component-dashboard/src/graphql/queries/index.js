import { gql } from '@apollo/client'

const manuscriptFragment = `
id
shortId
teams {
  id
  role
  name
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
  articleSections
  articleType
  history {
    type
    date
  }
}
submission
published
`

export default {
  dashboard: gql`
    {
      currentUser {
        id
        username
        admin
      }
      manuscriptsUserHasCurrentRoleIn {
        manuscriptVersions {
          ${manuscriptFragment}
          parentId
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
