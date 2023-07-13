import React from 'react'
import { set } from 'lodash'

import ContentWaxEditor from './editor/ContentWaxEditor'

import StaticTextInput from './components/StaticTextInput'

import { FormTextInput, ColorInput } from './style'

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

const staticTextInput = props => {
  return <StaticTextInput {...props} />
}

export const inputComponents = {
  TextField: FormTextInput,
  StaticTextInput: staticTextInput,
  AbstractEditor: richEditor,
  ColorInput,
}

export const inputFields = [
  {
    component: inputComponents.TextField,
    label: 'Page title*',
    name: 'title',
    type: 'text-input',
    isRequired: true,
  },

  {
    component: StaticTextInput,
    label: 'URL',
    name: 'url',
    type: 'text-input',
    isRequired: true,
    otherProps: {
      staticText: process.env.FLAX_SITE_URL,
    },
  },

  {
    component: inputComponents.AbstractEditor,
    label: '',
    name: 'content',
    flexGrow: true,
    type: 'rich-editor',
    isRequired: true,
    otherProps: {},
  },
]
