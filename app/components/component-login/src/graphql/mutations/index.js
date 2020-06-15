import gql from 'graphql-tag'

export const LOGIN_USER = gql`
  mutation($input: LoginUserInput) {
    loginUser(input: $input) {
      token
    }
  }
`
