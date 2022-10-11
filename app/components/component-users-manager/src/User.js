import React from 'react'
import gql from 'graphql-tag'
import { useMutation } from '@apollo/client'
import { Action } from '@pubsweet/ui'
import { UserAvatar } from '../../component-avatar/src'
import { Row, Cell, LastCell } from './style'

import { UserCombo, Primary, Secondary, UserInfo } from '../../shared'

import { convertTimestampToDateString } from '../../../shared/dateUtils'

const DELETE_USER = gql`
  mutation($id: ID) {
    deleteUser(id: $id) {
      id
    }
  }
`

const UPDATE_USER = gql`
  mutation($id: ID!, $input: String) {
    updateUser(id: $id, input: $input) {
      id
      admin
    }
  }
`

const User = ({ user, currentUser }) => {
  const [deleteUser] = useMutation(DELETE_USER)
  const [updateUser] = useMutation(UPDATE_USER)

  const makeUserText = user.admin ? 'Reviewer' : 'Admin'

  return (
    <Row>
      <Cell>
        <UserCombo>
          <UserAvatar user={user} />
          <UserInfo>
            <Primary>{user?.username}</Primary>
            <Secondary>{`ORCID: ${user?.defaultIdentity.identifier}`}</Secondary>
          </UserInfo>
        </UserCombo>
      </Cell>
      <Cell>{convertTimestampToDateString(user.created)}</Cell>
      <Cell>
        {user.lastOnline ? convertTimestampToDateString(user.lastOnline) : '-'}
      </Cell>
      <Cell>{user.admin ? 'yes' : ''}</Cell>
      <LastCell>
        <Action onClick={() => deleteUser({ variables: { id: user.id } })}>
          Delete
        </Action>
        <br />
        {user.id !== currentUser.id && (
          <Action
            onClick={() =>
              updateUser({
                variables: {
                  id: user.id,
                  input: JSON.stringify({
                    admin: !user.admin,
                  }),
                },
              })
            }
          >
            Make {makeUserText}
          </Action>
        )}
      </LastCell>
    </Row>
  )
}

export default User
