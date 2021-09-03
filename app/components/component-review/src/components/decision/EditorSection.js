import React from 'react'
import PropTypes from 'prop-types'
import FullWaxEditor from '../../../../wax-collab/src/FullWaxEditor'
import { Info } from '../style'

const EditorSection = ({ manuscript, onChange, onBlur, readonly }) => {
  // console.log('read only: ', readonly)

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

  React.useEffect(() => {
    // If we have an onBlur function specified, fire it when there's a dismount
    return () => (onBlur ? onBlur() : null)
  }, [])

  return (
    <FullWaxEditor
      onBlur={readonly ? null : onBlur}
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
  onBlur: PropTypes.func,
  onChange: PropTypes.func,
  readonly: PropTypes.bool,
}

EditorSection.defaultProps = {
  onChange: undefined,
  onBlur: undefined,
  readonly: false,
}

export default EditorSection
