import gql from 'graphql-tag'

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
        }
        reviews {
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
          object {
            objectId
            objectType
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
        _currentRoles @client
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
