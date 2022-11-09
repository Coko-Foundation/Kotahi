/* eslint-disable no-underscore-dangle */
import React from 'react'
import styled from 'styled-components'
import { Action, ActionGroup } from '@pubsweet/ui'
import PropTypes from 'prop-types'
import { Item, StatusBadge } from '../../style'
import Meta from '../metadata/Meta'
import MetadataSubmittedDate from '../metadata/MetadataSubmittedDate'
import MetadataAuthors from '../metadata/MetadataAuthors'
import ControlPageLink from '../ControlPageLink'

import Reviews from '../Reviews'
import VersionTitle from './VersionTitle'
import { MediumRow } from '../../../../shared'
import { LabelBadge } from '../../../../component-manuscripts/src/style'

const VersionTitleLink = styled(ControlPageLink)`
  color: #333;
  max-width: 60%;
  text-decoration: none;
`

const StyledActionGroup = styled(ActionGroup)`
  text-align: right;
`

const getMembersOfTeam = (version, role) => {
  if (!version.teams) return []

  const teams = version.teams.filter(team => team.teamType === role)
  return teams.length ? teams[0].members : []
}

const EditorItemLinks = ({ version, urlFrag }) => (
  <StyledActionGroup>
    <Action to={`${urlFrag}/versions/${version.parentId || version.id}/submit`}>
      Summary Info
    </Action>
    <Action
      data-testid="control-panel"
      to={`${urlFrag}/versions/${version.parentId || version.id}/decision`}
    >
      Control Panel
    </Action>
  </StyledActionGroup>
)

EditorItemLinks.propTypes = {
  version: PropTypes.shape({
    id: PropTypes.string.isRequired,
    parentId: PropTypes.string,
  }).isRequired,
}

const getMetadataObject = (version, value) => {
  const metadata = version.meta || {}
  return metadata[value] || []
}

const getSubmitedDate = version =>
  getMetadataObject(version, 'history').find(
    history => history.type === 'submitted',
  ) || []

const EditorItem = ({
  version,
  currentRoles,
  urlFrag,
  instanceName,
  shouldShowShortId,
  prettyRoleText,
}) => (
  // <Authorize object={[version]} operation="can view my manuscripts section">
  <>
    <Item>
      <MediumRow>
        <StatusBadge
          minimal
          published={version.published}
          status={version.status}
        />
        {version.hasOverdueTasksForUser && (
          <LabelBadge color="red">Overdue task</LabelBadge>
        )}
      </MediumRow>
      <Meta>
        <MetadataAuthors authors={getMembersOfTeam(version, 'author')} />
        {getSubmitedDate(version) ? (
          <MetadataSubmittedDate submitted={getSubmitedDate(version).date} />
        ) : null}
        &nbsp;You are {prettyRoleText(currentRoles)}.
      </Meta>
    </Item>
    <Item>
      <VersionTitleLink id={version.id} page="decision" version={version}>
        <VersionTitle
          instanceName={instanceName}
          shouldShowShortId={shouldShowShortId}
          version={version}
        />
      </VersionTitleLink>
      <EditorItemLinks urlFrag={urlFrag} version={version} />
    </Item>
    <Reviews version={version} />
  </>

  // </Authorize>
)

EditorItem.propTypes = {
  version: PropTypes.shape({
    id: PropTypes.string.isRequired,
    parentId: PropTypes.string,
    meta: PropTypes.shape({
      title: PropTypes.string.isRequired,
    }).isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    published: PropTypes.any, // TODO require boolean rather than any truthy or falsey value
    status: PropTypes.string.isRequired,
    teams: PropTypes.arrayOf(
      PropTypes.shape({
        role: PropTypes.string.isRequired,
        members: PropTypes.arrayOf(
          PropTypes.shape({
            status: PropTypes.string,
          }).isRequired,
        ).isRequired,
      }).isRequired,
    ).isRequired,
  }).isRequired,
  currentRoles: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
}

export default EditorItem
