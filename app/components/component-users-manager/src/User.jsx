import React from 'react'
import gql from 'graphql-tag'
import { useMutation } from '@apollo/react-hooks'
import { Action } from '@pubsweet/ui'
import { UserAvatar } from '../../component-avatar/src'
import { Row, Cell, LastCell } from './style'

import { UserCombo, Primary, Secondary, UserInfo } from '../../shared'

import { convertTimestampToDate } from '../../../shared/time-formatting'

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
      <Cell>
        <UserCombo>
          <UserAvatar user={user} />
          <UserInfo>
            <Primary>{user.username}</Primary>
            <Secondary>{user.email || '(via ORCID)'}</Secondary>
          </UserInfo>
        </UserCombo>
      </Cell>
      <Cell>{convertTimestampToDate(user.created)}</Cell>
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
