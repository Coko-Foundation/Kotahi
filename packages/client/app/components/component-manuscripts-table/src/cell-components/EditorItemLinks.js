import React from 'react'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import { LinkAction, SolidColumn } from '../../../shared'

const EditorItemLinks = ({ manuscript, urlFrag }) => {
  const { t } = useTranslation()
  return (
    <SolidColumn>
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
    </SolidColumn>
  )
}

EditorItemLinks.propTypes = {
  manuscript: PropTypes.shape({
    id: PropTypes.string.isRequired,
    parentId: PropTypes.string,
  }).isRequired,
}

export default EditorItemLinks
