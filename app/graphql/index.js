// TODO: Combine this with app/queries/index

import gql from 'graphql-tag'

export default {
  currentUser: gql`
    {
      currentUser {
        id
        username
        admin
        profilePicture
        defaultIdentity {
          aff
          name
        }
      }
    }
  `,
}
