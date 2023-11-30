/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useCallback, useState } from 'react'
import { grid, th } from '@pubsweet/ui-toolkit'
import { useTranslation } from 'react-i18next'
import { useDropzone } from 'react-dropzone'
import styled from 'styled-components'
import { color } from '../../../../theme'
import { convertTimestampToRelativeDateString } from '../../../../shared/dateUtils'
import { Placeholder } from '../../../component-dashboard/src/style'
import { ConfirmationModal } from '../../../component-modal/src/ConfirmationModal'
import FileRow from './FileRow'
import {
  Container,
  SectionContent,
  SectionRow,
  Icon,
  Spinner,
  Action,
} from '../../../shared'
import { HeadingCell } from './styles'

const Message = styled.div`
  align-items: center;
  color: inherit;
  display: flex;
  justify-content: center;
  width: 100%;

  svg {
    margin-left: ${grid(1)};
  }
`

const UploadAssetContainer = styled(Container)`
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: space-between;
  overflow: auto;
  padding: calc(8px * 2) calc(8px * 3);
`

const DropZoneContainer = styled.div`
  align-items: center;
  background-color: #fafafa;
  border-color: #eeeeee;
  border-radius: 2px;
  border-style: dashed;
  border-width: 2px;
  color: #bdbdbd;
  display: flex;
  flex: 1;
  flex-direction: column;
  outline: none;
  padding: 20px;
  transition: border 0.24s ease-in-out;
`

export const FileTableStyled = styled.div`
  font-size: ${th('fontSizeBaseSmall')};
  width: 100%;
`

export const FilesHeading = styled.div`
  align-items: center;
  background-color: ${color.backgroundA};
  border-top: 1px solid ${color.gray90};
  column-gap: ${grid(2)};
  display: flex;
  flex-direction: row;
  line-height: 1.4em;
  text-align: left;
  width: 100%;

  &:first-child {
    border-top: none;
    padding: ${grid(0.5)} ${grid(2)};
  }

  &:not(:first-child) {
    padding: ${grid(1.5)} ${grid(2)};
  }
`

const UploadAsset = ({ files, groupTemplateId }) => {
  const { t } = useTranslation()
  const [showSpinner, setShowSpinner] = useState(false)
  const [fileBeingDeletedId, setFileBeingDeletedId] = useState(null)
  const [filesState, setFilesState] = useState(files)

  const uploadAssetsFn = useCallback(async acceptedFiles => {
    const body = new FormData()

    acceptedFiles.forEach(f => body.append('files', f))

    body.append('groupTemplateId', groupTemplateId)
    let result = await fetch('/api/uploadAsset', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body,
    })

    result = await result.json()
    setFilesState([...result])
    setShowSpinner(false)
  }, [])

  const onDelete = id => {
    return async () => {
      setShowSpinner(true)

      let result = await fetch(`/api/deleteAsset`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      })

      result = await result.json()
      setFilesState([...result])
      setShowSpinner(false)
    }
  }

  const onDrop = useCallback(async acceptedFiles => {
    setShowSpinner(true)
    uploadAssetsFn(acceptedFiles)
  }, [])

  const onCopyAsImage = file => {
    return () =>
      navigator.clipboard.writeText(
        `<img data-name="${file.name}" data-id="${file.id}" src="${file.storedObjects[0].url}" />`,
      )
  }

  const onCopyAsUrl = file => {
    return () => navigator.clipboard.writeText(file.storedObjects[0].url)
  }

  const onCopyAsScriptLink = file => {
    return () =>
      navigator.clipboard.writeText(
        `<script data-name="${file.name}" data-id="${file.id}" src="${file.storedObjects[0].url}"></script>`,
      )
  }

  const onCopyAsCssLink = file => {
    return () =>
      navigator.clipboard.writeText(
        `<link data-name="${file.name}" data-id="${file.id}" rel="stylesheet" href="${file.storedObjects[0].url}" />`,
      )
  }

  const onCopyAsFont = file => {
    return () =>
      navigator.clipboard.writeText(
        `<link data-name="${file.name}" data-id="${file.id}" rel="preload" as="font" href="${file.storedObjects[0].url}" />`,
      )
  }

  const { getRootProps, getInputProps } = useDropzone({ onDrop })

  let counter = 1

  const columnsProps = [
    {
      name: 'id',
      centered: false,
      title: 'ID',
      // eslint-disable-next-line no-plusplus
      component: ({ file }) => counter++,
    },
    {
      name: 'created',
      centered: false,
      title: 'Created',
      component: ({ file }) => {
        return file && convertTimestampToRelativeDateString(file.created)
      },
    },
    {
      name: 'name',
      centered: false,
      title: 'Name',
      component: ({ file }) => file && file.name,
    },
    {
      name: 'copy-as-css',
      centered: false,
      title: 'Copy as Css',
      component: ({ file }) => (
        <Action onClick={onCopyAsCssLink(file)} primary>
          Create Css
        </Action>
      ),
    },
    {
      name: 'copy-as-script',
      centered: false,
      title: 'Copy as Script',
      component: ({ file }) => (
        <Action onClick={onCopyAsScriptLink(file)} primary>
          Create Script
        </Action>
      ),
    },
    {
      name: 'copy-as-image',
      centered: false,
      title: 'Copy as Image',
      component: ({ file }) => (
        <Action onClick={onCopyAsImage(file)} primary>
          Create Image
        </Action>
      ),
    },
    {
      name: 'copy-as-font',
      centered: false,
      title: 'Copy as Font',
      component: ({ file }) => (
        <Action onClick={onCopyAsFont(file)} primary>
          Create Font
        </Action>
      ),
    },
    {
      name: 'copy-as-url',
      centered: false,
      title: 'Copy as Url',
      component: ({ file }) => (
        <Action onClick={onCopyAsUrl(file)}>Create URL</Action>
      ),
    },
    {
      name: 'delete',
      centered: false,
      title: 'Delete',
      component: ({ file }) => (
        <>
          <Action onClick={() => setFileBeingDeletedId(file.id)}>Delete</Action>
        </>
      ),
    },
  ]

  return (
    <UploadAssetContainer>
      <SectionContent>
        <SectionRow key="upload-asset">
          <section>
            {!showSpinner ? (
              <DropZoneContainer {...getRootProps()}>
                <input {...getInputProps()} />
                <Message>
                  <>
                    {t('dragndrop.Drag and drop your files here')}
                    <Icon color={color.brand1.base()} inline>
                      file-plus
                    </Icon>
                  </>
                </Message>
              </DropZoneContainer>
            ) : (
              <Spinner />
            )}
          </section>
        </SectionRow>
        <SectionRow key="files">
          <FileTableStyled>
            <FilesHeading>
              {columnsProps.map(info => (
                <HeadingCell key={info.name}>{info.title}</HeadingCell>
              ))}
            </FilesHeading>
            {filesState.length === 0 ? (
              <Placeholder>No Files found</Placeholder>
            ) : (
              filesState.map((file, key) => (
                <FileRow
                  columnDefinitions={columnsProps}
                  file={file}
                  key={file.id}
                />
              ))
            )}
          </FileTableStyled>
        </SectionRow>
      </SectionContent>
      <ConfirmationModal
        closeModal={() => setFileBeingDeletedId(null)}
        confirmationAction={onDelete(fileBeingDeletedId)}
        confirmationButtonText={t('chat.delete')}
        isOpen={!!fileBeingDeletedId}
        message={
          <>
            {t('modals.deleteFile.Are you sure you want to delete this file?')}
          </>
        }
      />
    </UploadAssetContainer>
  )
}

export default UploadAsset
