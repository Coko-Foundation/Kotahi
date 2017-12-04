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
    options={options}
    className={className}
    value={value}
    placeholder={placeholder}
    placeholderClassName={placeholderClassName}
    title={title}
    onBlur={onBlur}
    onChange={onChange}
  />
)

export default TextEditor
