import React from 'react'
import gql from 'graphql-tag'
import { useMutation } from '@apollo/react-hooks'
import { Action } from '@pubsweet/ui'
import { UserAvatar } from '../../component-avatar/src'
import { Row, Cell, LastCell, UserCombo } from './style'

const DELETE_USER = gql`
  mutation($id: ID) {
    deleteUser(id: $id) {
      id
    }
  }
`

const User = ({ user }) => {
  const [deleteUser] = useMutation(DELETE_USER)

  return (
    <Row>
      <Cell><UserCombo><UserAvatar user={user}/>{user.username} {user.email}</UserCombo></Cell>
      <Cell>{user.created}</Cell>
      <Cell>{user.admin ? 'yes' : ''}</Cell>
      <LastCell>
        <Action onClick={() => deleteUser({ variables: { id: user.id } })}>
          Delete
        </Action>
      </LastCell>
    </Row>
  )
}

export default User
