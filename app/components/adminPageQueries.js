import gql from 'graphql-tag'

const QUERY = gql`
  query {
    currentUser {
      id
      profilePicture
      username
      admin
      email
      defaultIdentity {
        identifier
        email
        type
        aff
        id
      }
      isOnline
      _currentRoles {
        id
        roles
      }
      teams {
        id
        objectId
        objectType
        members {
          status
          user {
            id
          }
        }
      }
    }
    builtCss {
      css
    }
    userHasTaskAlerts
    config
  }
`

export default QUERY
