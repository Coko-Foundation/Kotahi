import React from 'react'
import styled from 'styled-components'
import { Action, ActionGroup } from '@pubsweet/ui'
import { Item, StatusBadge } from '../../style'
import Meta from '../metadata/Meta'
import MetadataSections from '../metadata/MetadataSections'
import MetadataType from '../metadata/MetadataType'
import MetadataReviewType from '../metadata/MetadataReviewType'
import MetadataSubmittedDate from '../metadata/MetadataSubmittedDate'
import MetadataAuthors from '../metadata/MetadataAuthors'
import MetadataStreamLined from '../metadata/MetadataStreamLined'
import JournalLink from '../JournalLink'
import Reviews from '../Reviews'
import VersionTitle from './VersionTitle'

const VersionTitleLink = styled(JournalLink)`
  text-decoration: none;
  color: #333;
`

const getUserFromTeam = (version, role) => {
  if (!version.teams) return []

  const teams = version.teams.filter(team => team.teamType === role)
  return teams.length ? teams[0].members : []
}

const EditorItemLinks = ({ version }) => (
  <ActionGroup>
    <Action to={`/journal/versions/${version.id}/submit`}>Summary Info</Action>
    <Action
      data-testid="control-panel"
      to={`/journal/versions/${version.id}/decisions/${version.id}`}
    >
      {version.decision && version.decision.status === 'submitted'
        ? `Decision: ${version.decision.recommendation}`
        : 'Control Panel'}
    </Action>
  </ActionGroup>
)

const getDeclarationsObject = (version, value) => {
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
      <StatusBadge minimal status={version.status} />
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
        <MetadataType type={getMetadataObject(version, 'articleType')} />
        <MetadataSections
          sections={getMetadataObject(version, 'articleSections')}
        />
        <MetadataReviewType
          openPeerReview={getDeclarationsObject(version, 'openPeerReview')}
        />
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

export default EditorItem
