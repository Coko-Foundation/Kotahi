import React from 'react'
import HtmlEditor from '../HtmlEditor'
import * as options from './config'

const TitleEditor = ({ className, value, placeholder, placeholderClassName, title, onBlur, onChange }) => (
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

export default TitleEditor
