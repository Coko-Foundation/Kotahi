import gql from 'graphql-tag'

export default {
  currentUser: gql`
    {
      currentUser {
        id
        username
        admin
      }
    }
  `,
}
