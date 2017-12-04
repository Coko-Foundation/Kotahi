import React from 'react'
import HtmlEditor from '../HtmlEditor'
import * as options from './config'

const AbstractEditor = ({
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
    value={value}
    className={className}
    placeholder={placeholder}
    placeholderClassName={placeholderClassName}
    title={title}
    onBlur={onBlur}
    onChange={onChange}
  />
)

export default AbstractEditor
