import React from 'react'
import PropTypes from 'prop-types'
import { Wax } from 'wax-prosemirror-core'
import SimpleWaxEditorLayout from '../../../wax-collab/src/layout/SimpleWaxEditorLayout'
import simpleWaxEditorConfig from '../../../wax-collab/src/config/SimpleWaxEditorConfig'

const FormWaxEditor = ({
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

  return (
    <div className={validationStatus} ref={innerRefProp}>
      <Wax
        autoFocus={autoFocus}
        browserSpellCheck={spellCheck}
        config={simpleWaxEditorConfig()}
        layout={SimpleWaxEditorLayout(readonly)}
        onBlur={val => {
          onChange && onChange(val)
          onBlur && onBlur(val)
        }}
        onChange={onChange}
        placeholder={placeholder}
        readonly={readonly}
        value={value}
        {...rest}
      />
    </div>
  )
}

FormWaxEditor.propTypes = {
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

FormWaxEditor.defaultProps = {
  value: '',
  validationStatus: undefined,
  readonly: false,
  autoFocus: false,
  onBlur: () => {},
  onChange: () => {},
  placeholder: '',
  spellCheck: false,
}

export default FormWaxEditor