import React from 'react'
import { set } from 'lodash'

import ContentWaxEditor from './editor/ContentWaxEditor'

import { FormTextInput } from './style'

import { hasValue } from '../../../shared/htmlUtils'

const richEditor = ({ validationStatus, setTouched, onChange, ...rest }) => {
  return (
    <ContentWaxEditor
      {...rest}
      onBlur={() => {
        setTouched(set({}, rest.name, true))
      }}
      onChange={val => {
        setTouched(set({}, rest.name, true))
        const cleanedVal = hasValue(val) ? val : ''
        onChange(cleanedVal)
      }}
    />
  )
}

export const inputComponents = {
  TextField: FormTextInput,
  AbstractEditor: richEditor,
}

export const inputFields = [
  {
    component: inputComponents.TextField,
    label: 'Page title',
    name: 'title',
    type: 'text-input',
  },

  {
    component: inputComponents.TextField,
    label: 'URL',
    name: 'url',
    type: 'text-input',
  },

  {
    component: inputComponents.AbstractEditor,
    label: '',
    name: 'content',
    flexGrow: true,
    type: 'rich-editor',
  },
]
