import gql from 'graphql-tag'

export const GET_CURRENT_USER = gql`
  query currentUser {
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
      email
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

const teamFields = `
  id
  name
  role
  manuscript {
    id
  }
  members {
    id
    user {
      id
      username
    }
  }
`

export const CREATE_TEAM_MUTATION = gql`
  mutation($input: TeamInput!) {
    createTeam(input: $input) {
      ${teamFields}
    }
  }
`

export const UPDATE_TEAM_MUTATION = gql`
  mutation($id: ID!, $input: TeamInput) {
    updateTeam(id: $id, input: $input) {
      ${teamFields}
    }
  }
`

export const UPDATE_INVITATION_STATUS = gql`
  mutation($id: ID!, $status: String, $userId: ID, $responseDate: DateTime) {
    updateInvitationStatus(
      id: $id
      status: $status
      userId: $userId
      responseDate: $responseDate
    ) {
      status
      responseDate
    }
  }
`
export const GET_BLACKLIST_INFORMATION = gql`
  query getBlacklistInformation($email: String) {
    getBlacklistInformation(email: $email) {
      id
    }
  }
`
export const UPDATE_INVITATION_RESPONSE = gql`
  mutation($id: ID!, $responseComment: String, $declinedReason: String!) {
    updateInvitationResponse(
      id: $id
      responseComment: $responseComment
      declinedReason: $declinedReason
    ) {
      responseComment
      declinedReason
      toEmail
    }
  }
`
export const GET_INVITATION_MANUSCRIPT_ID = gql`
  query invitationManuscriptId($id: ID) {
    invitationManuscriptId(id: $id) {
      manuscriptId
    }
  }
`

export const GET_INVITATION_STATUS = gql`
  query invitationStatus($id: ID) {
    invitationStatus(id: $id) {
      status
    }
  }
`

export const GET_INVITATIONS_FOR_MANUSCRIPT = gql`
  query getInvitationsForManuscript($id: ID) {
    getInvitationsForManuscript(id: $id) {
      id
      declinedReason
      responseComment
      responseDate
      invitedPersonName
      status
      invitedPersonType
      userId
      user {
        id
        username
        profilePicture
        online
      }
    }
  }
`
export const ADD_EMAIL_TO_BLACKLIST = gql`
  mutation($email: String!) {
    addEmailToBlacklist(email: $email) {
      email
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
export const ASSIGN_USER_AS_AUTHOR = gql`
mutation($manuscriptId: ID!, $userId: ID!) {
  assignUserAsAuthor(manuscriptId: $manuscriptId, userId: $userId ) {
    ${teamFields}
  }
}

`

export const GET_MANUSCRIPTS_AND_FORM = gql`
  query Manuscripts(
    $sort: ManuscriptsSort
    $filters: [ManuscriptsFilter!]!
    $offset: Int
    $limit: Int
  ) {
    paginatedManuscripts(
      sort: $sort
      filters: $filters
      offset: $offset
      limit: $limit
    ) {
      totalCount
      manuscripts {
        id
        shortId
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
              id
              username
            }
          }
        }
        manuscriptVersions {
          id
          shortId
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
                  identifier
                }
                id
                username
              }
            }
          }
          submitter {
            username
            online
            defaultIdentity {
              id
              identifier
              name
            }
            id
            profilePicture
          }
        }
        submitter {
          username
          online
          defaultIdentity {
            id
            identifier
            name
          }
          id
          profilePicture
        }
      }
    }

    formForPurposeAndCategory(purpose: "submit", category: "submission") {
      structure {
        children {
          id
          component
          name
          title
          shortDescription
          validate {
            id
            label
            value
            labelColor
          }
          validateValue {
            minChars
            maxChars
            minSize
          }
          doiValidation
          options {
            id
            label
            labelColor
            value
          }
        }
      }
    }
  }
`
export const IMPORT_MANUSCRIPTS = gql`
  mutation {
    importManuscripts
  }
`
export const IMPORTED_MANUSCRIPTS_SUBSCRIPTION = gql`
  subscription manuscriptsImportStatus {
    manuscriptsImportStatus
  }
`
export const GET_SYSTEM_WIDE_DISCUSSION_CHANNEL = gql`
  query {
    systemWideDiscussionChannel {
      id
    }
  }
`
