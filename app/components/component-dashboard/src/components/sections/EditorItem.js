/* eslint-disable no-underscore-dangle */
import React from 'react'
import styled from 'styled-components'
import { Action, ActionGroup } from '@pubsweet/ui'
import config from 'config'
import PropTypes from 'prop-types'
import { Item, StatusBadge } from '../../style'
import Meta from '../metadata/Meta'
import MetadataSubmittedDate from '../metadata/MetadataSubmittedDate'
import MetadataAuthors from '../metadata/MetadataAuthors'
import MetadataStreamLined from '../metadata/MetadataStreamLined'
import JournalLink from '../JournalLink'
import Reviews from '../Reviews'
import VersionTitle from './VersionTitle'
import prettyRoleText from '../../../../../shared/prettyRoleText'

const VersionTitleLink = styled(JournalLink)`
  color: #333;
  text-decoration: none;
`

const getUserFromTeam = (version, role) => {
  if (!version.teams) return []

  const teams = version.teams.filter(team => team.teamType === role)
  return teams.length ? teams[0].members : []
}

const urlFrag = config.journal.metadata.toplevel_urlfragment

const EditorItemLinks = ({ version }) => (
  <ActionGroup>
    <Action to={`${urlFrag}/versions/${version.parentId || version.id}/submit`}>
      Summary Info
    </Action>
    <Action
      data-testid="control-panel"
      to={`${urlFrag}/versions/${version.parentId || version.id}/decision`}
    >
      {version.decision && version.decision.status === 'submitted'
        ? `Decision: ${version.decision.recommendation}`
        : 'Control Panel'}
    </Action>
  </ActionGroup>
)

EditorItemLinks.propTypes = {
  version: PropTypes.element.isRequired,
}

const getDeclarationsObject = (version, value) => {
  // eslint-disable-next-line no-param-reassign
  if (!version.meta) version.meta = {}
  const declarations = version.meta.declarations || {}

  return declarations[value] || 'no'
}

const getMetadataObject = (version, value) => {
  const metadata = version.meta || {}
  return metadata[value] || []
}

const getSubmitedDate = version =>
  getMetadataObject(version, 'history').find(
    history => history.type === 'submitted',
  ) || []

const EditorItem = ({ version }) => (
  // <Authorize object={[version]} operation="can view my manuscripts section">
  <>
    <Item>
      <StatusBadge
        minimal
        published={version.published}
        status={version.status}
      />
      <Meta>
        <MetadataStreamLined
          streamlinedReview={getDeclarationsObject(
            version,
            'streamlinedReview',
          )}
        />
        <MetadataAuthors authors={getUserFromTeam(version, 'author')} />
        {getSubmitedDate(version) ? (
          <MetadataSubmittedDate submitted={getSubmitedDate(version).date} />
        ) : null}
        &nbsp;You are {prettyRoleText(version._currentRoles)}.
      </Meta>
    </Item>
    <Item>
      <VersionTitleLink id={version.id} page="decisions" version={version}>
        <VersionTitle version={version} />
      </VersionTitleLink>
      <EditorItemLinks version={version} />
    </Item>
    <Reviews version={version} />
  </>

  // </Authorize>
)

EditorItem.propTypes = {
  version: PropTypes.element.isRequired,
}

export default EditorItem
