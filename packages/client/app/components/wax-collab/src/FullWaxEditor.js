import React, { useRef, useEffect, useContext, useCallback } from 'react'
import PropTypes from 'prop-types'
import { ThemeProvider } from 'styled-components'
import { debounce } from 'lodash'
import { Wax } from 'wax-prosemirror-core'
import { JournalContext } from '../../xpub-journal/src'
import waxTheme from './layout/waxTheme'
import fullWaxEditorConfig from './config/FullWaxEditorConfig'
import yjsConfig from './config/yjsConfig'
import FullWaxEditorLayout from './layout/FullWaxEditorLayout'
import ProductionWaxEditorLayout from './layout/ProductionWaxEditorLayout'

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
  aiConfig,
  onAssetManager,
  value,
  validationStatus,
  readonly,
  autoFocus,
  saveSource,
  getComments,
  setComments,
  placeholder,
  useComments,
  authorComments,
  fileUpload,
  user,
  manuscriptId,
  getActiveViewDom,
  wsProvider,
  ydoc,
  name,
}) => {
  const handleAssetManager = () => onAssetManager(manuscriptId)
  const journal = useContext(JournalContext)

  const debouncedSave = useCallback(
    debounce(source => {
      if (saveSource) saveSource(source)
    }, 6000),
    [],
  )

  useEffect(() => {
    return () => debouncedSave.flush()
  }, [])

  const waxUser = {
    userId: user.id || '-',
    userColor: {
      addition: 'royalblue',
      deletion: 'indianred',
    },
    username: user.username || 'demo',
  }

  const editorRef = useRef(null)

  const config = yjsConfig(
    fullWaxEditorConfig(
      handleAssetManager,
      getComments,
      setComments,
      readonly,
      aiConfig,
    ),
    {
      wsProvider,
      ydoc,
      yjsType: name,
    },
  )

  return (
    <ThemeProvider theme={{ textStyles: journal.textStyles, ...waxTheme }}>
      <div className={validationStatus} style={{ width: '100%' }}>
        <Wax
          autoFocus={autoFocus}
          config={config}
          fileUpload={file => renderImage(file)}
          key={`readonly-${readonly}`}
          layout={
            useComments
              ? ProductionWaxEditorLayout(readonly, authorComments, false)
              : FullWaxEditorLayout(readonly, getActiveViewDom)
          }
          onChange={source => debouncedSave(source)}
          placeholder={placeholder}
          readonly={readonly}
          ref={editorRef}
          user={waxUser}
          value={value}
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
