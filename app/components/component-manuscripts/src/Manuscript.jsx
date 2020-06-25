import React from 'react'
import gql from 'graphql-tag'
import { useMutation } from '@apollo/react-hooks'
import { Action } from '@pubsweet/ui'
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
  NormalStatus
} from './style'
import { convertTimestampToDate } from '../../../shared/time-formatting'

const DELETE_MANUSCRIPT = gql`
  mutation($id: ID) {
    deleteManuscript(id: $id) {
      id
    }
  }
`


const Status = ({status}) => {
  if (status === 'accepted') {
    return <SuccessStatus>{status}</SuccessStatus>
  } else if (status === 'rejected') {
    return <ErrorStatus>{status}</ErrorStatus>
  }
  return <NormalStatus>{status}</NormalStatus>
}

const User = ({ manuscript }) => {
  const [deleteManuscript] = useMutation(DELETE_MANUSCRIPT)

  return (
    <Row>
      <Cell>
        { manuscript.meta && manuscript.meta.title }
        {/* <UserCombo>
          <UserAvatar manuscript={manuscript} />
          <UserInfo>
            <Primary>{manuscript.username}</Primary>
            <Secondary>{manuscript.email || '(via ORCID)'}</Secondary>
          </UserInfo>
        </UserCombo> */}
      </Cell>
      <Cell>{convertTimestampToDate(manuscript.created)}</Cell>
      <Cell><Status status={manuscript.status}/></Cell>
      <LastCell>
        <Action to={`/journal/versions/${manuscript.id}/manuscript`}>
            View
          </Action>

        <Action onClick={() => deleteManuscript({ variables: { id: manuscript.id } })}>
          Delete
        </Action>
      </LastCell>
    </Row>
  )
}

export default User
