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
  readonly,
}) => (
  <HtmlEditor
    className={className}
    onBlur={onBlur}
    onChange={onChange}
    options={options}
    placeholder={placeholder}
    placeholderClassName={placeholderClassName}
    readonly={readonly}
    title={title}
    value={value}
  />
)

export default TitleEditor
