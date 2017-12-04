import React from 'react'
import HtmlEditor from '../HtmlEditor'
import * as options from './config'

const TitleEditor = ({
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

export default TitleEditor
