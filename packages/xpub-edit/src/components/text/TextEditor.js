import React from 'react'
import HtmlEditor from '../HtmlEditor'

// TODO: only allow a single line of text (no line-breaks)
// TODO: ensure that content is saved when component is unmounted or blurred

import * as options from './config'

const TextEditor = ({
  className,
  value,
  placeholder,
  placeholderClassName,
  title,
  onBlur,
  onChange,
}) => (
  <HtmlEditor
    className={className}
    onBlur={onBlur}
    onChange={onChange}
    options={options}
    placeholder={placeholder}
    placeholderClassName={placeholderClassName}
    title={title}
    value={value}
  />
)

export default TextEditor
