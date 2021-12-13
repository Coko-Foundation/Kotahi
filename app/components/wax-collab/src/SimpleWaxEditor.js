import React, { useCallback } from 'react'
import PropTypes from 'prop-types'
import { Wax } from 'wax-prosemirror-core'
import { debounce } from 'lodash'
import simpleWaxEditorConfig from './config/SimpleWaxEditorConfig'
import SimpleWaxEditorLayout from './layout/SimpleWaxEditorLayout'

// import './katex/katex.css'
import fixAstralUnicode from './fixAstralUnicode'

const SimpleWaxEditor = ({
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
  // TODO remove this step once we have a fix in Wax for https://gitlab.coko.foundation/kotahi/kotahi/-/issues/693
  // eslint-disable-next-line no-param-reassign
  value = fixAstralUnicode(value)

  const debounceChange = useCallback(debounce(onChange ?? (() => {}), 1000), [])
  return (
    <div className={validationStatus} ref={innerRefProp}>
      <Wax
        autoFocus={autoFocus}
        browserSpellCheck={spellCheck}
        config={simpleWaxEditorConfig()}
        // fileUpload={file => renderImage(file)}
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
