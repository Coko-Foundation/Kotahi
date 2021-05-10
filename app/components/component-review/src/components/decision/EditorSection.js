import React from 'react'
import PropTypes from 'prop-types'
import Wax from '../../../../wax-collab/src/Editoria'
import { EditorWrapper, Info } from '../style'

const EditorSection = ({ manuscript }) => {
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
    <EditorWrapper>
      <Wax content={manuscript.meta.source} readonly />
    </EditorWrapper>
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
}

export default EditorSection
