import React, { useCallback } from 'react'
import PropTypes from 'prop-types'
import { debounce } from 'lodash'
import { Wax } from 'wax-prosemirror-core'

import fullWaxEditorConfig from './config/FullWaxEditorConfig'
import fullWaxEditorCommentsConfig from './config/FullWaxEditorCommentsConfig'
import FullWaxEditorLayout from './layout/FullWaxEditorLayout'
import FullWaxEditorCommentsLayout from './layout/FullWaxEditorCommentsLayout'

import './katex/katex.css'

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
  fileUpload,
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
          useComments ? fullWaxEditorCommentsConfig() : fullWaxEditorConfig()
        }
        fileUpload={file => renderImage(file)}
        layout={
          useComments
            ? FullWaxEditorCommentsLayout(readonly)
            : FullWaxEditorLayout(readonly)
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

FullWaxEditor.propTypes = {
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

FullWaxEditor.defaultProps = {
  value: '',
  validationStatus: undefined,
  readonly: false,
  autoFocus: false,
  onBlur: () => {},
  onChange: () => {},
  placeholder: '',
  fileUpload: () => {},
  useComments: false,
  user: {},
}

export default FullWaxEditor
