/* eslint-disable import/prefer-default-export */
import { gql } from '@apollo/client'

const ADD_TEAM_MEMBERS = gql`
  mutation AddTeamMembers($teamId: ID!, $members: [ID!]!, $status: String) {
    addTeamMembers(teamId: $teamId, members: $members, status: $status) {
      id
      role
      name
      members {
        id
        status
        user {
          id
          username
        }
      }
    }
  }
`

const UPDATE_TEAM_MEMBER = gql`
  mutation UpdateTeamMember($id: ID!, $input: String) {
    updateTeamMember(id: $id, input: $input) {
      id
      status
      user {
        id
        username
      }
    }
  }
`

const REMOVE_TEAM_MEMBER = gql`
  mutation RemoveTeamMember($teamId: ID!, $userId: ID!) {
    removeTeamMember(teamId: $teamId, userId: $userId) {
      id
    }
  }
`

export { ADD_TEAM_MEMBERS, REMOVE_TEAM_MEMBER, UPDATE_TEAM_MEMBER }
