import React from 'react'
import { pickBy } from 'lodash'

import { Action, ActionGroup } from '@pubsweet/ui'
// import Authorize from 'pubsweet-client/src/helpers/Authorize'

import { Item, Header, Body, StatusBadge } from '../../style'
import VersionTitle from './VersionTitle'

const OwnerItem = ({ version, journals, deleteManuscript }) => {
  const baseLink = `/journal/versions/${version.id}`
  const submitLink = `${baseLink}/submit`
  const manuscriptLink = `${baseLink}/manuscript`

  const actionButtons = {
    submit: (
      <Action key="submit-action" to={submitLink}>
        Summary Info
      </Action>
    ),
    manuscript: (
      <Action key="manuscript-action" to={manuscriptLink}>
        Manuscript
      </Action>
    ),
    delete: (
      <Action key="delete-action" onClick={() => deleteManuscript(version)}>
        Delete
      </Action>
    ),
  }

  const unauthorized = (
    <ActionGroup>
      {Object.values(pickBy(actionButtons, (value, key) => key !== 'delete'))}
    </ActionGroup>
  )

  const actions = (
    // <Authorize
    //   object={version}
    //   operation="can delete manuscript"
    //   unauthorized={unauthorized}
    // >
    <ActionGroup>{Object.values(actionButtons)}</ActionGroup>
    // </Authorize>
  )

  return (
    <Item>
      <div>
        {' '}
        <StatusBadge minimal status={version.status} />
        {JSON.stringify(version._currentRoles)}
        <VersionTitle version={version} />
      </div>
      {actions}
    </Item>
  )
}

export default OwnerItem
