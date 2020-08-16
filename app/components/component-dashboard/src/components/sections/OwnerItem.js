import React from 'react'
import { Action, ActionGroup } from '@pubsweet/ui'
import { Item, StatusBadge } from '../../style'
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

  const actions = <ActionGroup>{Object.values(actionButtons)}</ActionGroup>

  return (
    <Item>
      <div>
        {' '}
        <StatusBadge
          minimal
          published={version.published}
          status={version.status}
        />
        <VersionTitle version={version} />
      </div>
      {actions}
    </Item>
  )
}

export default OwnerItem
