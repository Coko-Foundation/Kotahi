import React from 'react'
import gql from 'graphql-tag'
import { useMutation } from '@apollo/client'
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
  // SuccessStatus,
  // ErrorStatus,
  // NormalStatus,
  UserAction as Action,
  StatusBadge,
} from './style'

import { convertTimestampToDate } from '../../../shared/time-formatting'

const DELETE_MANUSCRIPT = gql`
  mutation($id: ID!) {
    deleteManuscript(id: $id)
  }
`

// manuscriptId is always the parent manuscript's id
const User = ({ manuscriptId, manuscript, submitter }) => {
  const [deleteManuscript] = useMutation(DELETE_MANUSCRIPT, {
    update(cache, { data: { deleteManuscript } }) {
      const id = cache.identify({
        __typename: 'Manuscript',
        id: deleteManuscript,
      })
      cache.evict({ id })
    },
  })

  return (
    <Row>
      <Cell>{manuscript.meta && manuscript.meta.title}</Cell>
      <Cell>{convertTimestampToDate(manuscript.created)}</Cell>
      <Cell>{convertTimestampToDate(manuscript.updated)}</Cell>
      <Cell>
        <StatusBadge status={manuscript.status} />
      </Cell>
      <Cell>
        {submitter && (
          <UserCombo>
            <UserAvatar user={submitter} />
            <UserInfo>
              <Primary>{submitter.defaultIdentity.name}</Primary>
              <Secondary>
                {submitter.email || `(${submitter.username})`}
              </Secondary>
            </UserInfo>
          </UserCombo>
        )}
      </Cell>
      <LastCell>
        <Action to={`/journal/versions/${manuscriptId}/decision`}>
          Control
        </Action>
        <Action to={`/journal/versions/${manuscriptId}/manuscript`}>
          View
        </Action>
        <Action
          onClick={() => deleteManuscript({ variables: { id: manuscriptId } })}
        >
          Delete
        </Action>
      </LastCell>
    </Row>
  )
}

export default User
