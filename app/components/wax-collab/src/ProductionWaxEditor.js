import React, { useCallback } from 'react'
import PropTypes from 'prop-types'
import { debounce } from 'lodash'
import { Wax } from 'wax-prosemirror-core'
import productionWaxEditorConfig from './config/ProductionWaxEditorConfig'
import productionWaxEditorNoCommentsConfig from './config/ProductionWaxEditorNoCommentsConfig'
import ProductionWaxEditorLayout from './layout/ProductionWaxEditorLayout'
import ProductionWaxEditorNoCommentsLayout from './layout/ProductionWaxEditorNoCommentsLayout'

import './katex/katex.css'

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
  fileUpload,
  useComments,
  user,
  ...rest
}) => {
  const defaultUser = {
    userId: 'b3cfc28e-0f2e-45b5-b505-e66783d4f946',
    userColor: {
      addition: 'royalblue',
      deletion: 'indianred',
    },
    username: 'admin',
  }

  const ourUser = { ...defaultUser, ...user } // this is just to make sure we have a user object

  const debounceChange = useCallback(debounce(onChange ?? (() => {}), 1000), [])
  return (
    <div className={validationStatus}>
      <Wax
        autoFocus={autoFocus}
        config={
          useComments
            ? productionWaxEditorConfig()
            : productionWaxEditorNoCommentsConfig()
        }
        fileUpload={file => renderImage(file)}
        layout={
          useComments
            ? ProductionWaxEditorLayout(readonly)
            : ProductionWaxEditorNoCommentsLayout(readonly)
        }
        onBlur={val => {
          onChange && onChange(val)
          onBlur && onBlur(val)
        }}
        onChange={debounceChange}
        placeholder={placeholder}
        readonly={readonly}
        user={ourUser}
        value={value}
        {...rest}
      />
    </div>
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
  fileUpload: () => {},
  useComments: true,
  user: {},
}

export default ProductionWaxEditor
