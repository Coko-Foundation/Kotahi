import React, { useCallback } from 'react'
import PropTypes from 'prop-types'
import { Wax } from 'wax-prosemirror-core'

// import './katex/katex.css'
// import fixAstralUnicode from './fixAstralUnicode'
import simpleWaxEditorConfig from '../../../wax-collab/src/config/SimpleWaxEditorConfig'
import SimpleWaxEditorLayout from '../../../wax-collab/src/layout/SimpleWaxEditorLayout'
import { debounce } from 'lodash'

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
  // eslint-disable-next-line no-param-reassign
//   value = fixAstralUnicode(value)
  // console.log(validationStatus,'validationStatus')
  const debounceChange = useCallback(debounce(onChange ?? (() => {}), 1000), [])
  // console.log(debounceChange,'debounceChange')
// function handleChange(e) {
    // console.log(e.target.value)
//   }
//   console.log(onChange, 'onchange')
// const onchange = {}
  return (
    <div className={validationStatus} ref={innerRefProp}>
      <Wax
        autoFocus={autoFocus}
        browserSpellCheck={spellCheck}
        config={simpleWaxEditorConfig()}
        fileUpload={file => renderImage(file)}
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
