import React from 'react'
import PropTypes from 'prop-types'
import { adopt } from 'react-adopt'
import FullWaxEditor from '../../../../wax-collab/src/FullWaxEditor'
import { Info } from '../style'
import { getSpecificFilesQuery } from '../../../../asset-manager/src/queries'
import withModal from '../../../../asset-manager/src/ui/Modal/withModal'

const mapper = {
  getSpecificFilesQuery,
  withModal,
}

const mapProps = args => ({
  onAssetManager: manuscriptId =>
    new Promise((resolve, reject) => {
      const {
        withModal: { showModal, hideModal },
      } = args

      const handleImport = async selectedFileIds => {
        const {
          getSpecificFilesQuery: { client, query },
        } = args

        const { data } = await client.query({
          query,
          variables: { ids: selectedFileIds },
        })

        const { getSpecificFiles } = data

        const alteredFiles = getSpecificFiles.map(getSpecificFile => {
          const mediumSizeFile = getSpecificFile.storedObjects.find(
            storedObject => storedObject.type === 'medium',
          )

          return {
            source: mediumSizeFile.url,
            mimetype: mediumSizeFile.mimetype,
            ...getSpecificFile,
          }
        })

        hideModal()
        resolve(alteredFiles)
      }

      showModal('assetManagerEditor', {
        manuscriptId,
        withImport: true,
        handleImport,
      })
    }),
})

const Composed = adopt(mapper, mapProps)

const EditorSection = ({
  manuscript,
  saveSource,
  onChange,
  onBlur,
  readonly,
  currentUser,
}) => {
  const manuscriptFile = manuscript?.files?.find(file =>
    file.tags.includes('manuscript'),
  )

  if (!manuscriptFile) {
    return <Info>No manuscript file loaded</Info>
  }

  if (
    manuscriptFile.storedObjects[0].mimetype !==
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  )
    return <Info>No supported view of the file</Info>

  // React.useEffect(() => {
  //   // If we have an onBlur function specified, fire it when there's a dismount
  // eslint-disable-next-line no-console
  //   console.log('useEffect in EditorSection running')
  //   return () => (onBlur ? onBlur() : null)
  // }, [])

  const editorTeam = manuscript?.teams?.find(team => {
    return team.role.toLowerCase().includes('editor')
  })

  const authorTeam = manuscript?.teams?.find(team => {
    return team.role.toLowerCase().includes('author')
  })

  const currentUserIsAuthor =
    authorTeam && currentUser
      ? authorTeam.members.find(member => member.user.id === currentUser.id)
      : false

  const currentUserIsEditor =
    editorTeam && currentUser
      ? editorTeam.members.find(member => member.user.id === currentUser.id)
      : false

  const isAuthorMode = !!(currentUserIsAuthor && readonly)

  return (
    <Composed
      currentUser={currentUser}
      isAuthorMode={isAuthorMode}
      isCurrentUserAuthor={currentUserIsAuthor}
      isCurrentUserEditor={currentUserIsEditor}
      manuscript={manuscript}
      readonly={readonly}
      saveSource={saveSource}
    >
      {({ onAssetManager }) => (
        <div>
          <FullWaxEditor
            authorComments={isAuthorMode}
            manuscriptId={manuscript.id}
            // onChange={readonly && !isAuthorMode ? null : onBlur}
            // onChange={readonly && !isAuthorMode ? null : onChange}
            onAssetManager={onAssetManager}
            readonly={readonly}
            saveSource={saveSource}
            useComments={
              !!(
                currentUserIsEditor ||
                currentUser.groupRoles.includes('groupManager') ||
                (currentUserIsAuthor && readonly)
              )
            }
            user={currentUser}
            value={manuscript.meta.source}
          />
        </div>
      )}
    </Composed>
  )
}

EditorSection.propTypes = {
  manuscript: PropTypes.shape({
    files: PropTypes.arrayOf(
      PropTypes.shape({
        storedObjects: PropTypes.arrayOf(PropTypes.object.isRequired),
        tags: PropTypes.arrayOf(PropTypes.string.isRequired),
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
