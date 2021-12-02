import React, { useRef } from 'react'
import PropTypes from 'prop-types'
// import { debounce } from 'lodash'
import { Wax } from 'wax-prosemirror-core'
import { ThemeProvider } from 'styled-components'
import waxTheme from './layout/waxTheme'

import productionWaxEditorConfig from './config/ProductionWaxEditorConfig'
import ProductionWaxEditorLayout from './layout/ProductionWaxEditorLayout'
import ProductionWaxEditorNoCommentsLayout from './layout/ProductionWaxEditorNoCommentsLayout'

// import './katex/katex.css'

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
  onBlur,
  onChange,
  placeholder,
  readOnlyComments,
  fileUpload,
  useComments,
  user,
  ...rest
}) => {
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
          config={productionWaxEditorConfig(readOnlyComments)}
          fileUpload={file => renderImage(file)}
          layout={
            useComments
              ? ProductionWaxEditorLayout(readonly)
              : ProductionWaxEditorNoCommentsLayout(readonly)
          }
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

ProductionWaxEditor.propTypes = {
  value: PropTypes.string,
  validationStatus: PropTypes.string,
  readonly: PropTypes.bool,
  autoFocus: PropTypes.bool,
  onBlur: PropTypes.func,
  onChange: PropTypes.func,
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
  validationStatus: undefined,
  readonly: false,
  autoFocus: false,
  onBlur: () => {},
  onChange: () => {},
  placeholder: '',
  readOnlyComments: false,
  fileUpload: () => {},
  useComments: true,
  user: {},
}

export default ProductionWaxEditor
