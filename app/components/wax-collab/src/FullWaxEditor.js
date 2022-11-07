import React, { useRef, useEffect, useContext } from 'react'
import PropTypes from 'prop-types'
import { ThemeProvider } from 'styled-components'
import { Wax } from 'wax-prosemirror-core'
import { JournalContext } from '../../xpub-journal/src'
import waxTheme from './layout/waxTheme'
import fullWaxEditorConfig from './config/FullWaxEditorConfig'
import FullWaxEditorLayout from './layout/FullWaxEditorLayout'
import FullWaxEditorCommentsLayout from './layout/FullWaxEditorCommentsLayout'

// TODO Save this image via the server
const renderImage = file => {
  const reader = new FileReader()
  return new Promise((resolve, reject) => {
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(reader.error)
    // Some extra delay to make the asynchronicity visible
    setTimeout(() => {
      reader.readAsDataURL(file)
    }, 150)
  })
}

const FullWaxEditor = ({
  onAssetManager,
  value,
  validationStatus,
  readonly,
  autoFocus,
  saveSource,
  placeholder,
  useComments,
  authorComments,
  fileUpload,
  user,
  manuscriptId,
  ...rest
}) => {
  const handleAssetManager = () => onAssetManager(manuscriptId)
  const journal = useContext(JournalContext)

  const waxUser = {
    userId: user.id || '-',
    userColor: {
      addition: 'royalblue',
      deletion: 'indianred',
    },
    username: user.username || 'demo',
  }

  const editorRef = useRef(null)

  /* eslint-disable jsx-a11y/no-noninteractive-tabindex,  jsx-a11y/tabindex-no-positive */
  useEffect(() => {
    return () => {
      if (editorRef.current && saveSource !== null) {
        saveSource(editorRef.current.getContent())
      }
    }
  }, [])
  return (
    <ThemeProvider theme={{ textStyles: journal.textStyles, ...waxTheme }}>
      <div className={validationStatus} style={{ width: '100%' }}>
        <Wax
          autoFocus={autoFocus}
          config={fullWaxEditorConfig(handleAssetManager)}
          fileUpload={file => renderImage(file)}
          layout={
            useComments
              ? FullWaxEditorCommentsLayout(readonly, authorComments)
              : FullWaxEditorLayout(readonly)
          }
          onChange={source => {
            saveSource(source)
          }}
          placeholder={placeholder}
          readonly={readonly}
          ref={editorRef}
          user={waxUser}
          value={value}
          {...rest}
        />
      </div>
    </ThemeProvider>
  )
}

FullWaxEditor.propTypes = {
  value: PropTypes.string,
  validationStatus: PropTypes.string,
  readonly: PropTypes.bool,
  autoFocus: PropTypes.bool,
  saveSource: PropTypes.func,
  placeholder: PropTypes.string,
  fileUpload: PropTypes.func,
  authorComments: PropTypes.bool,
  useComments: PropTypes.bool,
  user: PropTypes.shape({
    userId: PropTypes.string,
    userName: PropTypes.string,
    userColor: PropTypes.shape({
      addition: PropTypes.string,
      deletion: PropTypes.string,
    }),
  }),
}

FullWaxEditor.defaultProps = {
  value: '',
  validationStatus: undefined,
  readonly: false,
  autoFocus: false,
  saveSource: () => {},
  placeholder: '',
  authorComments: false,
  fileUpload: () => {},
  useComments: false,
  user: {},
}

export default FullWaxEditor
