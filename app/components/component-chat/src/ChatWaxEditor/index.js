import React, { useCallback, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Wax } from 'wax-prosemirror-core'
import { debounce } from 'lodash'
import chatWaxEditorConfig from './ChatWaxEditorConfig'
import chatWaxEditorLayout from './ChatWaxEditorLayout'

const ChatWaxEditor = ({
  value,
  validationStatus,
  readonly,
  autoFocus,
  onBlur,
  onChange,
  placeholder,
  spellCheck,
  innerRefProp,
  ...rest
}) => {
  const debounceChange = useCallback(debounce(onChange ?? (() => {}), 1000), [])
  useEffect(() => debounceChange.flush, [])

  return (
    <div className={validationStatus} ref={innerRefProp}>
      <Wax
        autoFocus={autoFocus}
        browserSpellCheck={spellCheck}
        config={chatWaxEditorConfig()}
        layout={chatWaxEditorLayout(readonly)}
        onBlur={val => {
          debounceChange.flush() // Probably redundant now that we have debounceChange.flush() during component cleanup (the useEffect code above)
          onBlur && onBlur(val)
        }}
        onChange={debounceChange}
        placeholder={placeholder}
        readonly={readonly}
        value={value}
        {...rest}
      />
    </div>
  )
}

ChatWaxEditor.propTypes = {
  /** editor content HTML */
  value: PropTypes.string,
  /** either undefined or 'error' to highlight with error color */
  validationStatus: PropTypes.string,
  readonly: PropTypes.bool,
  /** Should this element be given focus on initial rendering? */
  autoFocus: PropTypes.bool,
  onBlur: PropTypes.func,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  /** Should enable browser's native spellcheck? */
  spellCheck: PropTypes.bool,
}

ChatWaxEditor.defaultProps = {
  value: '',
  validationStatus: undefined,
  readonly: false,
  autoFocus: false,
  onBlur: () => {},
  onChange: () => {},
  placeholder: '',
  spellCheck: false,
}

export default ChatWaxEditor
