import React, { useCallback, useEffect } from 'react'
import { ValidatedFieldFormik } from '@pubsweet/ui'
import { adopt } from 'react-adopt'
import { debounce } from 'lodash'
import { inputFields } from '../FormSettings'
import { getSpecificFilesQuery } from '../../../asset-manager/src/queries'
import withModal from '../../../asset-manager/src/ui/Modal/withModal'
import { convertTimestampToDateTimeString } from '../../../../shared/dateUtils'

import {
  Section,
  Page,
  EditorForm,
  ActionButtonContainer,
  FormActionButton,
  VerticalBar,
  FlaxCenter,
  StatusInfoText,
  NewEditText,
} from '../style'

// Todo: Currently this is breaking the rules of keeping all the server calls
// and everything on the top-level component.
// We need to fix it and pass the getSpecificFilesQuery as a function
// something like getFilesById which takes the ids and returns the files.

const mapper = {
  getSpecificFilesQuery,
  withModal,
}

const mapProps = args => ({
  onAssetManager: manuscriptId => {
    return new Promise((resolve, reject) => {
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
    })
  },
})

const Composed = adopt(mapper, mapProps)

const CMSPageEditForm = ({
  onSubmit,
  setFieldValue,
  setTouched,
  key,
  submitButtonText,
  cmsPage,
  saveData,
}) => {
  const autoSave = useCallback(debounce(saveData ?? (() => {}), 1000), [])

  useEffect(() => autoSave.flush, [])

  const onDataChanged = (itemKey, value) => {
    const data = {}
    data[itemKey] = value
    autoSave(cmsPage.id, data)
  }

  const getInputFieldSpecificProps = (item, { onAssetManager }) => {
    let props = {}

    switch (item.type) {
      case 'text-input':
        props.onChange = value => {
          let val = value

          if (value.target) {
            val = value.target.value
          } else if (value.value) {
            val = value.value
          }

          setFieldValue(item.name, val, false)
          onDataChanged(item.name, val)
        }

        break

      case 'rich-editor':
        props.onChange = value => {
          setFieldValue(item.name, value)
          onDataChanged(item.name, value)
        }

        props.onAssetManager = () => onAssetManager(cmsPage.id)
        break

      default:
        props = {}
    }

    return props
  }

  const isPublished = () => !!cmsPage.published

  const isEdited = () =>
    !cmsPage.published || cmsPage.published < cmsPage.edited

  return (
    <Composed>
      {({ onAssetManager }) => (
        <Page>
          <EditorForm key={key} onSubmit={onSubmit}>
            {inputFields.map(item => {
              return (
                <Section flexGrow={item.flexGrow || false} key={item.name}>
                  <p style={{ fontSize: '10px' }}>{item.label}</p>
                  <ValidatedFieldFormik
                    component={item.component}
                    name={item.name}
                    setTouched={setTouched}
                    style={{ width: '100%' }}
                    {...getInputFieldSpecificProps(item, { onAssetManager })}
                  />
                </Section>
              )
            })}
            <ActionButtonContainer>
              <FormActionButton onClick={onSubmit} primary>
                {submitButtonText}
              </FormActionButton>

              <StatusInfoText>
                {isEdited() && (
                  <FlaxCenter>
                    <NewEditText>New edits on page</NewEditText> <VerticalBar />
                  </FlaxCenter>
                )}
                <FlaxCenter>
                  Edited on {convertTimestampToDateTimeString(cmsPage.edited)}
                  <VerticalBar />
                </FlaxCenter>
                <FlaxCenter>
                  {isPublished()
                    ? `Published on ${convertTimestampToDateTimeString(
                        cmsPage.published,
                      )}`
                    : 'Not published yet'}
                </FlaxCenter>
              </StatusInfoText>
            </ActionButtonContainer>
          </EditorForm>
        </Page>
      )}
    </Composed>
  )
}

export default CMSPageEditForm
