import React from 'react'
import gql from 'graphql-tag'
import { useMutation } from '@apollo/react-hooks'
// import { Action } from '@pubsweet/ui'
import { UserAvatar } from '../../component-avatar/src'
import {
  Row,
  Cell,
  LastCell,
  UserCombo,
  Primary,
  Secondary,
  UserInfo,
  SuccessStatus,
  ErrorStatus,
  NormalStatus,
  UserAction as Action,
  StatusBadge,
} from './style'

import { convertTimestampToDate } from '../../../shared/time-formatting'

const DELETE_MANUSCRIPT = gql`
  mutation($id: ID!) {
    deleteManuscript(id: $id)
  }
`


const User = ({ manuscript }) => {
  const [deleteManuscript] = useMutation(DELETE_MANUSCRIPT)

  return (
    <Row>
      <Cell>
        {manuscript.meta && manuscript.meta.title}
      </Cell>
      <Cell>{convertTimestampToDate(manuscript.created)}</Cell>
      <Cell>
        <StatusBadge status={manuscript.status} />
      </Cell>
      <Cell>
        {manuscript.submitter && (
          <UserCombo>
            <UserAvatar user={manuscript.submitter} />
            <UserInfo>
              <Primary>{manuscript.submitter.defaultIdentity.name}</Primary>
              <Secondary>
                {manuscript.submitter.email || `(${manuscript.submitter.username})`}
              </Secondary>
            </UserInfo>
          </UserCombo>
        )}
      </Cell>
      <LastCell>
        <Action to={`/journal/versions/${manuscript.id}/decisions/1`}>
          Control
        </Action>
        <Action to={`/journal/versions/${manuscript.id}/manuscript`}>
          View
        </Action>
        <Action
          onClick={() => deleteManuscript({ variables: { id: manuscript.id } })}
        >
          Delete
        </Action>
      </LastCell>
    </Row>
  )
}

export default User
