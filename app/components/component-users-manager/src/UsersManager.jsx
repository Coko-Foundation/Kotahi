import React from 'react'
import gql from 'graphql-tag'
import { Query } from '@apollo/react-components'

import User from './User'

const GET_USERS = gql`
  {
    users {
      id
      username
      teams {
        id
        role
        name
        object {
          objectId
        }
        members {
          user {
            id
            username
          }
        }
      }
    }
  }
`

const UsersManager = () => (
  <Query query={GET_USERS}>
    {({ loading, error, data }) => {
      if (loading) return 'Loading...'
      if (error) return `Error! ${error.message}`

      return (
        <div>
          <table>
            <thead>
              <tr>
                <th>id</th>
                <th>Username</th>
                <th>Email</th>
                <th>Admin</th>
                <th>Teams</th>
              </tr>
            </thead>
            <tbody>
              {data.users.map((user, key) => (
                <User key={user.id} number={key + 1} user={user} />
              ))}
            </tbody>
          </table>
        </div>
      )
    }}
  </Query>
)

export default UsersManager
