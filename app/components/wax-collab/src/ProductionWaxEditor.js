import React, { useRef, useEffect, useContext } from 'react'
import PropTypes from 'prop-types'
import { Wax } from 'wax-prosemirror-core'
import { ThemeProvider } from 'styled-components'
import waxTheme from './layout/waxTheme'
import { JournalContext } from '../../xpub-journal/src'

import productionWaxEditorConfig from './config/ProductionWaxEditorConfig'
import ProductionWaxEditorLayout from './layout/ProductionWaxEditorLayout'
import ProductionWaxEditorNoCommentsLayout from './layout/ProductionWaxEditorNoCommentsLayout'

// this was forked from FullWaxEditor.js

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

const ProductionWaxEditor = ({
  value,
  validationStatus,
  readonly,
  autoFocus,
  saveSource,
  placeholder,
  readOnlyComments,
  fileUpload,
  useComments,
  user,
  manuscriptId,
  onAssetManager,
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
      if (editorRef.current) {
        saveSource(editorRef.current.getContent())
      }
    }
  }, [])

  // return useMemo(
  //   () => (
  return (
    <ThemeProvider theme={{ textStyles: journal.textStyles, ...waxTheme }}>
      <div
        className={validationStatus}
        // onBlur={e => {
        //   e.preventDefault()
        //   saveSource(editorRef.current.getContent())
        // }}
        // tabIndex={1}
      >
        <Wax
          autoFocus={autoFocus}
          config={productionWaxEditorConfig(
            readOnlyComments,
            handleAssetManager,
          )}
          fileUpload={file => renderImage(file)}
          layout={
            useComments
              ? ProductionWaxEditorLayout(readonly)
              : ProductionWaxEditorNoCommentsLayout(readonly)
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
  // 	,
  //   [],
  // )
}

ProductionWaxEditor.propTypes = {
  value: PropTypes.string,
  validationStatus: PropTypes.string,
  readonly: PropTypes.bool,
  autoFocus: PropTypes.bool,
  saveSource: PropTypes.func,
  placeholder: PropTypes.string,
  fileUpload: PropTypes.func,
  readOnlyComments: PropTypes.bool,
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

ProductionWaxEditor.defaultProps = {
  value: '',
  validationStatus: '',
  readonly: false,
  autoFocus: false,
  placeholder: '',
  readOnlyComments: false,
  fileUpload: () => {},
  saveSource: () => {},
  useComments: true,
  user: {},
}

export default ProductionWaxEditor
