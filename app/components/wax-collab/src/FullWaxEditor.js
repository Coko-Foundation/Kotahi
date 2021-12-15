import React, { useRef } from 'react'
import PropTypes from 'prop-types'
import { ThemeProvider } from 'styled-components'
// import { debounce } from 'lodash'
import { Wax } from 'wax-prosemirror-core'
import waxTheme from './layout/waxTheme'
import fixAstralUnicode from './fixAstralUnicode'

import fullWaxEditorConfig from './config/FullWaxEditorConfig'
import FullWaxEditorLayout from './layout/FullWaxEditorLayout'
import FullWaxEditorCommentsLayout from './layout/FullWaxEditorCommentsLayout'

// import './katex/katex.css'

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
  value,
  validationStatus,
  readonly,
  autoFocus,
  onBlur,
  onChange,
  placeholder,
  useComments,
  authorComments,
  fileUpload,
  user,
  ...rest
}) => {
  // TODO remove this step once we have a fix in Wax for https://gitlab.coko.foundation/kotahi/kotahi/-/issues/693
  // eslint-disable-next-line no-param-reassign
  value = fixAstralUnicode(value)

  const waxUser = {
    userId: user.id || '-',
    userColor: {
      addition: 'royalblue',
      deletion: 'indianred',
    },
    username: user.username || 'demo',
  }

  const editorRef = useRef(null)

  // const debounceChange = useCallback(debounce(onChange ?? (() => {}), 1000), [])
  return (
    <ThemeProvider theme={waxTheme}>
      <div
        className={validationStatus}
        onBlur={() => {
          onBlur(editorRef.current.getContent())
        }}
      >
        <Wax
          autoFocus={autoFocus}
          config={fullWaxEditorConfig()}
          fileUpload={file => renderImage(file)}
          layout={
            useComments
              ? FullWaxEditorCommentsLayout(readonly, authorComments)
              : FullWaxEditorLayout(readonly)
          }
          onChange={() => {
            // This only fires in read-only mode if an author comment has been added.
            // We don't need to debounce because the comment has been added to the editor content.
            if (readonly) {
              onBlur(editorRef.current.getContent())
            }
          }}
          // onBlur={val => {
          //   onChange && onChange(val)
          //   onBlur && onBlur(val)
          // }}
          // onChange={debounceChange}
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
  onBlur: PropTypes.func,
  onChange: PropTypes.func,
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
  onBlur: () => {},
  onChange: () => {},
  placeholder: '',
  authorComments: false,
  fileUpload: () => {},
  useComments: false,
  user: {},
}

export default FullWaxEditor
