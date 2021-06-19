import gql from 'graphql-tag'

export const GET_CURRENT_USER = gql`
  query currentUser {
    currentUser {
      id
      profilePicture
      username
      admin
      defaultIdentity {
        identifier
        email
        type
        aff
        id
        name
      }
      online
      _currentRoles {
        id
        roles
      }
      teams {
        id
        manuscript {
          id
          status
        }
        members {
          status
          user {
            id
          }
        }
      }
    }
  }
`

export const GET_USER = gql`
  query user($id: ID, $username: String) {
    user(id: $id, username: $username) {
      id
      username
      profilePicture
      online
    }
  }
`

export const CREATE_MESSAGE = gql`
  mutation createMessage($content: String, $channelId: String) {
    createMessage(content: $content, channelId: $channelId) {
      content
      user {
        username
      }
    }
  }
`

export const GET_MESSAGE_BY_ID = gql`
  query messageById($messageId: ID) {
    message(messageId: $messageId) {
      id
      content
      user {
        username
        profilePicture
      }
    }
  }
`

export const SEARCH_USERS = gql`
  query searchUsers($teamId: ID, $query: String) {
    searchUsers(teamId: $teamId, query: $query) {
      id
      username
      profilePicture
      online
    }
  }
`

export const VALIDATE_DOI = gql`
  query Manuscripts($articleURL: String) {
    validateDOI(articleURL: $articleURL) {
      isDOIValid
    }
  }
`

export const DELETE_MANUSCRIPT = gql`
  mutation($id: ID!) {
    deleteManuscript(id: $id)
  }
`

export const DELETE_MANUSCRIPTS = gql`
  mutation($ids: [ID]!) {
    deleteManuscripts(ids: $ids)
  }
`

export const GET_MANUSCRIPTS = gql`
  query Manuscripts(
    $sort: String
    $filter: ManuscriptsFilter
    $offset: Int
    $limit: Int
  ) {
    paginatedManuscripts(
      sort: $sort
      filter: $filter
      offset: $offset
      limit: $limit
    ) {
      totalCount
      manuscripts {
        id
        meta {
          manuscriptId
          title
        }
        submission
        created
        updated
        status
        published
        teams {
          id
          role
          members {
            id
            user {
              defaultIdentity {
                name
              }
              id
              username
            }
          }
        }
        manuscriptVersions {
          id
          meta {
            manuscriptId
            title
          }
          created
          updated
          status
          submitter {
            username
            online
            defaultIdentity {
              id
              name
            }
            profilePicture
          }
        }
        submitter {
          username
          online
          defaultIdentity {
            id
            name
          }
          profilePicture
        }
      }
    }
  }
`
export const IMPORT_MANUSCRIPTS = gql`
  mutation {
    importManuscripts {
      totalCount
      manuscripts {
        id
        submission
        created
        updated
        status
        meta {
          manuscriptId
          title
        }
      }
    }
  }
`
