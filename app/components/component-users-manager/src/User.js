import React, { useEffect, useState } from 'react'
import { Action } from '@pubsweet/ui'
import { UserAvatar } from '../../component-avatar/src'
import {
  UserCombo,
  Primary,
  Secondary,
  UserInfo,
  Row,
  Cell,
  LastCell,
  MinimalSelect,
} from '../../shared'
import { ConfirmationModal } from '../../component-modal/src/ConfirmationModal'
import { convertTimestampToDateString } from '../../../shared/dateUtils'

const User = ({
  user,
  currentUser,
  deleteUser,
  setGlobalRole,
  setGroupRole,
}) => {
  const roleOptions = []

  if (
    currentUser.globalRoles.includes('admin') &&
    !user.groupRoles.includes('groupManager') &&
    !user.globalRoles.includes('admin')
  )
    roleOptions.push({
      value: 'user',
      label: 'User',
      scope: 'group',
      // We don't let someone unassign themselves from 'user' role unless they're also an admin
      isFixed:
        user.id === currentUser.id &&
        !currentUser.globalRoles.includes('admin'),
    })

  roleOptions.push(
    {
      value: 'groupManager',
      label: 'Group Manager',
      scope: 'group',
      // We don't let someone unassign themselves from 'groupManager' role unless they're also an admin
      isFixed:
        user.id === currentUser.id &&
        !currentUser.globalRoles.includes('admin'),
    },
    {
      value: 'admin',
      label: 'Admin',
      scope: 'global',
      // We don't let someone unassign themselves from 'admin' role;
      // and non-admins can't assign/unassign admin role
      isFixed:
        user.id === currentUser.id ||
        !currentUser.globalRoles.includes('admin'),
    },
  )

  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)
  const [roleConfirm, setRoleConfirm] = useState(null)

  const [roles, setRoles] = useState([])
  useEffect(
    () =>
      setRoles(
        roleOptions.filter(
          option =>
            user.groupRoles.includes(option.value) ||
            user.globalRoles.includes(option.value),
        ),
      ),
    [user.groupRoles, user.globalRoles],
  )

  const onChangeRoles = (changedRoles, actionMeta) => {
    const differingRole = actionMeta.removedValue || actionMeta.option
    const isAdding = actionMeta.action === 'select-option'
    if (!differingRole) return

    const setFunc =
      differingRole.scope === 'global' ? setGlobalRole : setGroupRole

    setRoleConfirm({
      action: () => {
        setFunc({
          variables: {
            userId: user.id,
            role: differingRole.value,
            shouldEnable: isAdding,
          },
        })
        setRoles(changedRoles)
      },
      message: (
        <p>
          Do you wish to {isAdding ? 'assign' : 'remove'} the{' '}
          <b>{differingRole.label}</b> role for user {user.username}?
        </p>
      ),
    })
  }

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
      <Cell>
        <MinimalSelect
          captureMenuScroll
          isClearable={false}
          isMulti
          menuPortalTarget={document.querySelector('body')}
          onChange={onChangeRoles}
          options={roleOptions.filter(x => !x.isFixed)}
          placeholder="None"
          value={roles}
        />
        <ConfirmationModal
          closeModal={() => setRoleConfirm(null)}
          confirmationAction={roleConfirm?.action}
          confirmationButtonText="Yes"
          isOpen={!!roleConfirm}
          message={roleConfirm?.message}
        />
      </Cell>
      <LastCell>
        {/* 
        Only admins can delete a user or groupManager; 
        admins cannot delete themselves; 
        groupManagers can only remove users with `user` or `groupManager` roles from a group */}
        {currentUser.globalRoles.includes('admin') &&
          currentUser.id !== user.id && (
            <Action onClick={() => setIsConfirmingDelete(true)}>Delete</Action>
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
