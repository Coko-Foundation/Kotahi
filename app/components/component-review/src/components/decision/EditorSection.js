import React from 'react'
import PropTypes from 'prop-types'
import FullWaxEditor from '../../../../wax-collab/src/FullWaxEditor'
import { Info } from '../style'

const EditorSection = ({
  manuscript,
  onChange,
  onBlur,
  readonly,
  currentUser,
}) => {
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

  const editorTeam = manuscript?.teams?.find(team => {
    return team.role.toLowerCase().includes('editor')
  })

  const authorTeam = manuscript?.teams?.find(team => {
    return team.role.toLowerCase().includes('author')
  })

  const isCurrentUserAuthor =
    authorTeam && currentUser
      ? authorTeam.members.find(member => member.user.id === currentUser.id)
      : false

  const isCurrentUserEditor =
    editorTeam && currentUser
      ? editorTeam.members.find(member => member.user.id === currentUser.id)
      : false

  return (
    <FullWaxEditor
      authorComments={!!(isCurrentUserAuthor && readonly)}
      onBlur={readonly ? null : onBlur}
      onChange={readonly ? null : onChange}
      readonly={readonly}
      useComments={
        !!(
          isCurrentUserEditor ||
          currentUser?.admin ||
          (isCurrentUserAuthor && readonly)
        )
      }
      user={currentUser}
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
