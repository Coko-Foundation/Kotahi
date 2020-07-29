import gql from 'graphql-tag'

const fragmentFields = `
  id
  created
  meta {
    manuscriptId
    title
  }
`

export default {
  teamManager: gql`
  query {
    teams {
      id
      role
      name
      object {
        objectId
        objectType
      }
      members {
        user {
          id
        }
      }
    }

    users {
      id
      username
      admin
    }

    manuscripts {
      ${fragmentFields}
      manuscriptVersions {
        ${fragmentFields}
      }
    }
  }
  `,
}
