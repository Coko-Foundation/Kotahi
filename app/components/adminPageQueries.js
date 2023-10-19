import gql from 'graphql-tag'

const QUERY = gql`
  query {
    currentUser {
      id
      profilePicture
      username
      globalRoles
      groupRoles
      email
      recentTab
      preferredLanguage
      defaultIdentity {
        identifier
        email
        type
        aff
        id
      }
      isOnline
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
  }
`

export default QUERY
