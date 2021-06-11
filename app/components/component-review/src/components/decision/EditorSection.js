import React from 'react'
import PropTypes from 'prop-types'
import FullWaxEditor from '../../../../wax-collab/src/FullWaxEditor'
import { Info } from '../style'

const EditorSection = ({ manuscript, onChange, readonly }) => {
  const manuscriptFile = manuscript?.files?.find(
    file => file.fileType === 'manuscript',
  )

  if (!manuscriptFile) {
    return <Info>No manuscript file loaded</Info>
  }

  if (
    manuscriptFile.mimeType !==
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  )
    return <Info>No supported view of the file</Info>

  return (
    <FullWaxEditor
      onChange={readonly ? null : onChange}
      readonly={readonly}
      value={manuscript.meta.source}
    />
  )
}

EditorSection.propTypes = {
  manuscript: PropTypes.shape({
    files: PropTypes.arrayOf(
      PropTypes.shape({
        fileType: PropTypes.string.isRequired,
        mimeType: PropTypes.string.isRequired,
      }),
    ),
    meta: PropTypes.shape({
      source: PropTypes.string,
    }).isRequired,
  }).isRequired,
  onChange: PropTypes.func,
  readonly: PropTypes.bool,
}

EditorSection.defaultProps = {
  onChange: undefined,
  readonly: false,
}

export default EditorSection
