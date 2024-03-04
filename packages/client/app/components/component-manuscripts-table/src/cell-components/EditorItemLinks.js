import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import { LinkAction } from '../../../shared'

const Container = styled.div`
  display: flex;
  flex-direction: column;
`

const EditorItemLinks = ({ manuscript, urlFrag }) => {
  const { t } = useTranslation()
  return (
    <Container>
      <LinkAction
        dataTestId="control-panel-team"
        to={`${urlFrag}/versions/${
          manuscript.parentId || manuscript.id
        }/decision`}
      >
        {t('manuscriptsTable.Control')}
      </LinkAction>
      <LinkAction
        dataTestId="production-editor"
        to={`${urlFrag}/versions/${manuscript.id}/production`}
      >
        {t('manuscriptsTable.Production')}
      </LinkAction>
    </Container>
  )
}

EditorItemLinks.propTypes = {
  manuscript: PropTypes.shape({
    id: PropTypes.string.isRequired,
    parentId: PropTypes.string,
  }).isRequired,
}

export default EditorItemLinks
