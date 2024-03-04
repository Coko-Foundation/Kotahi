import React, { useCallback, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Wax } from 'wax-prosemirror-core'
import { debounce } from 'lodash'
import simpleWaxEditorConfig from './config/SimpleWaxEditorConfig'
import SimpleWaxEditorLayout from './layout/SimpleWaxEditorLayout'

const SimpleWaxEditor = ({
  value,
  validationStatus,
  readonly,
  autoFocus,
  onBlur,
  onChange,
  placeholder,
  spellCheck,
  ...rest
}) => {
  const debounceChange = useCallback(debounce(onChange ?? (() => {}), 1000), [])
  useEffect(() => debounceChange.flush, [])

  return (
    <div className={validationStatus}>
      <Wax
        autoFocus={autoFocus}
        browserSpellCheck={spellCheck}
        config={simpleWaxEditorConfig()}
        key={`readonly-${readonly}`} // Force remount to overcome Wax bugs on changing between editable and readonly
        layout={SimpleWaxEditorLayout(readonly)}
        onBlur={val => {
          onChange && onChange(val)
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

SimpleWaxEditor.propTypes = {
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

SimpleWaxEditor.defaultProps = {
  value: '',
  validationStatus: undefined,
  readonly: false,
  autoFocus: false,
  onBlur: () => {},
  onChange: () => {},
  placeholder: '',
  spellCheck: false,
}

export default SimpleWaxEditor
