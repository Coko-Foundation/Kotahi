import React from 'react'
import { set } from 'lodash'

import { ValidatedFieldFormik } from '@pubsweet/ui'

import FormWaxEditor from '../../component-formbuilder/src/components/FormWaxEditor'

import { Section, Legend, Page } from './style'

import { TextInput, ActionButton, PaddedContent } from '../../shared'

import { hasValue } from '../../../shared/htmlUtils'

const inputComponents = {
  TextField: TextInput,
}

inputComponents.AbstractEditor = ({
  validationStatus,
  setTouched,
  onChange,
  ...rest
}) => {
  return (
    <FormWaxEditor
      validationStatus={validationStatus}
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

const inputFields = [
  {
    component: inputComponents.TextField,
    label: 'Label',
    name: 'title',
    type: 'text-input',
  },

  {
    component: inputComponents.AbstractEditor,
    label: 'Header',
    name: 'header',
  },
  {
    component: inputComponents.AbstractEditor,
    label: 'Body',
    name: 'body',
  },
  {
    component: inputComponents.AbstractEditor,
    label: 'Footer',
    name: 'footer',
  },
]

const FormView = ({
  onSubmit,
  setFieldValue,
  setTouched,
  key,
  updatePageStatus,
  submitButtonText,
}) => {
  return (
    <Page>
      <form key={key} onSubmit={onSubmit}>
        {inputFields.map(item => {
          return (
            <Section key={item.name}>
              <Legend space>{item.label}</Legend>
              <ValidatedFieldFormik
                component={item.component}
                name={item.name}
                onChange={value => {
                  if (item.type === 'text-input') {
                    let val = value

                    if (value.target) {
                      val = value.target.value
                    } else if (value.value) {
                      val = value.value
                    }

                    setFieldValue(item.name, val, false)
                    return
                  }

                  setFieldValue(item.name, value)
                }}
                setTouched={setTouched}
              />
            </Section>
          )
        })}
        <PaddedContent>
          <ActionButton primary status={updatePageStatus} type="submit">
            {submitButtonText}
          </ActionButton>
        </PaddedContent>
      </form>
    </Page>
  )
}

export default FormView
