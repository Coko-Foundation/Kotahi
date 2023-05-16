import React, { useState } from 'react'
import { Action } from '@pubsweet/ui'
import { UserAvatar } from '../../component-avatar/src'
import { Row, Cell, LastCell } from './style'
import { UserCombo, Primary, Secondary, UserInfo } from '../../shared'
import { ConfirmationModal } from '../../component-modal/src/ConfirmationModal'
import { convertTimestampToDateString } from '../../../shared/dateUtils'

const User = ({ user, currentUser, deleteUser, setGroupRole }) => {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)

  const makeUserText = user.groupRoles.includes('groupManager')
    ? 'Remove Group Manager role'
    : 'Make Group Manager'

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
      <Cell>{user.groupRoles.includes('groupManager') ? 'yes' : ''}</Cell>
      <LastCell>
        {/* TODO confirmation on delete */}
        <Action onClick={() => setIsConfirmingDelete(true)}>Delete</Action>
        <br />
        {user.id !== currentUser.id && (
          <Action
            onClick={() =>
              setGroupRole({
                variables: {
                  userId: user.id,
                  role: 'groupManager',
                  shouldEnable: !user.groupRoles.includes('groupManager'),
                },
              })
            }
          >
            {makeUserText}
          </Action>
        )}
      </LastCell>
      <ConfirmationModal
        closeModal={() => setIsConfirmingDelete(false)}
        confirmationAction={() => deleteUser({ variables: { id: user.id } })}
        confirmationButtonText="Delete"
        isOpen={isConfirmingDelete}
        message={`Permanently delete user ${user.username}?`}
      />
    </Row>
  )
}

export default User
