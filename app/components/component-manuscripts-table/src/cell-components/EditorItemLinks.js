import React from 'react'
import PropTypes from 'prop-types'
import { Action, ActionGroup } from '@pubsweet/ui'
import { Users, MessageSquare } from 'react-feather'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'

const StyledActionGroup = styled(ActionGroup)`
  text-align: left;
`

const StyledAction = styled(Action)`
  align-items: center;
  display: flex;
  font-size: 14px;
`

const EditorItemLinks = ({ manuscript, urlFrag }) => {
  const { t } = useTranslation()
  return (
    <StyledActionGroup>
      <StyledAction
        data-testid="control-panel-decision"
        to={{
          pathname: `${urlFrag}/versions/${
            manuscript.parentId || manuscript.id
          }/decision`,
          state: { tab: 'Decision' },
        }}
      >
        <MessageSquare />
        &nbsp;{t('manuscriptsTable.Decision')}
      </StyledAction>
      <StyledAction
        data-testid="control-panel-team"
        to={{
          pathname: `${urlFrag}/versions/${
            manuscript.parentId || manuscript.id
          }/decision`,
          state: { tab: 'Team' },
        }}
      >
        <Users />
        &nbsp;{t('manuscriptsTable.Team')}
      </StyledAction>
    </StyledActionGroup>
  )
}

EditorItemLinks.propTypes = {
  manuscript: PropTypes.shape({
    id: PropTypes.string.isRequired,
    parentId: PropTypes.string,
  }).isRequired,
}

export default EditorItemLinks
