import React from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'
import { set } from 'lodash'
import { adopt } from 'react-adopt'
import { hasValue } from '../../../../../shared/htmlUtils'
import CollaborativeWax from '../../../../wax-collab/src/CollaborativeWax'
import { getSpecificFilesQuery } from '../../../../asset-manager/src/queries'
import withModal from '../../../../asset-manager/src/ui/Modal/withModal'
import theme, { space, color } from '../../../../../theme'

const Panel = styled.div`
  background-color: ${() => color.brand2.tint90};
  border: 1px solid ${() => color.brand2.tint70};
  border-radius: ${theme.borderRadius};
  padding: ${space.f} ${space.e} ${space.b} ${space.e};

  & .Dropdown-control {
    max-height: 36px;
  }
`

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

const FullWaxField = ({
  validationStatus,
  setTouched,
  onChange,
  currentUser,
  readonly,
  ...rest
}) => {
  const saveSource = () => {} // TODO

  const manuscript = { id: null } // TODO

  return (
    <Panel>
      <Composed
        currentUser={currentUser}
        isAuthorMode={false}
        isCurrentUserAuthor={false}
        isCurrentUserEditor
        manuscript={manuscript}
        readonly={readonly}
        saveSource={saveSource}
      >
        {() => (
          <div>
            <CollaborativeWax
              editorMode="FullWaxEditor"
              validationStatus={validationStatus}
              {...rest}
              onBlur={() => {
                setTouched(set({}, rest.name, true))
              }}
              onChange={val => {
                setTouched(set({}, rest.name, true))
                const cleanedVal = hasValue(val) ? val : ''
                onChange(cleanedVal)
              }}
            />
          </div>
        )}
      </Composed>
    </Panel>
  )
}

FullWaxField.propTypes = {
  validationStatus: PropTypes.string,
  setTouched: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
}
FullWaxField.defaultProps = {
  validationStatus: undefined,
}

export default FullWaxField
