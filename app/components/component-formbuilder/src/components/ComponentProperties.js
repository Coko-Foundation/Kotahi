import React, { useState } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { isEmpty, omitBy } from 'lodash'
import { Formik } from 'formik'
import { ValidatedFieldFormik, Menu, Button } from '@pubsweet/ui'
import { th } from '@pubsweet/ui-toolkit'
import { v4 as uuid } from 'uuid'
import {
  elements as components,
  submissionElements as submissionComponents,
} from './config/Elements'
import * as elements from './builderComponents'
import { Section, Legend, Page, Heading, DetailText } from './style'

const InvalidWarning = styled.div`
  color: ${th('colorError')};
`

const getComponentProperties = (componentType, formCategory) =>
  formCategory === 'submission'
    ? submissionComponents[componentType] ?? {}
    : components[componentType] ?? {}

const getEditableComponentProperties = (
  componentType,
  formCategory,
  shouldAllowHypothesisTagging,
) =>
  Object.entries(getComponentProperties(componentType, formCategory)).filter(
    ([key]) =>
      key !== 'id' &&
      (key !== 'publishingTag' || shouldAllowHypothesisTagging === 'true'),
  )

const ComponentProperties = ({
  formErrors,
  onSubmit,
  selectedComponent,
  setComponentType,
  setFieldValue,
  category,
  shouldAllowHypothesisTagging,
}) => {
  const populateDefaultValues = componentType => {
    getEditableComponentProperties(
      componentType,
      category,
      shouldAllowHypothesisTagging,
    ).forEach(([key, value]) => {
      if (value.defaultValue) setFieldValue(key, value.defaultValue)
    })
  }

  let componentTypeOptions = Object.keys(components).map(value => ({
    value,
    label: value,
  }))
  // Disable ThreadedDiscussion in review forms
  if (['submission', 'review'].includes(category))
    componentTypeOptions = componentTypeOptions.filter(
      o => o.label !== 'ThreadedDiscussion',
    )
  // Disable ManuscriptFile in review and decision forms
  if (['review', 'decision'].includes(category))
    componentTypeOptions = componentTypeOptions.filter(
      o => o.label !== 'ManuscriptFile',
    )

  const editableProperties = getEditableComponentProperties(
    selectedComponent,
    category,
    shouldAllowHypothesisTagging,
  )

  const formIsValid = !Object.keys(formErrors).length

  return (
    <Page key={selectedComponent}>
      <form onSubmit={onSubmit}>
        <Heading>Field Properties</Heading>
        <Section>
          <Legend space>Field type</Legend>
          <ValidatedFieldFormik
            component={Menu}
            name="component"
            onChange={value => {
              setComponentType(value)
              setFieldValue('component', value)
              populateDefaultValues(value)
            }}
            options={componentTypeOptions}
            required
          />
        </Section>
        {editableProperties.map(([key, value]) => (
          <Section key={key}>
            <Legend space>{value.props?.label ?? `Field ${key}`}</Legend>
            <ValidatedFieldFormik
              component={elements[value.component].default}
              name={key}
              onChange={val => {
                if (isEmpty(val)) {
                  setFieldValue(key, null)
                  return
                }

                setFieldValue(key, val.target ? val.target.value : val)
              }}
              required={key === 'name' || key === 'title'}
              {...{ ...value.props, label: undefined, description: undefined }}
            />
            {value.props?.description && (
              <DetailText>{value.props.description}</DetailText>
            )}
          </Section>
        ))}
        <Button disabled={!formIsValid} primary type="submit">
          Update Field
        </Button>
        {!formIsValid && (
          <InvalidWarning>
            Correct invalid values before updating
          </InvalidWarning>
        )}
      </form>
    </Page>
  )
}

ComponentProperties.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  selectedComponent: PropTypes.string,
  setComponentType: PropTypes.func.isRequired,
  setFieldValue: PropTypes.func.isRequired,
}

ComponentProperties.defaultProps = {
  selectedComponent: null,
}

const prepareForSubmit = values => {
  const cleanedValues = omitBy(values, value => value === '')
  if (
    cleanedValues.component !== 'Select' &&
    cleanedValues.component !== 'CheckboxGroup' &&
    cleanedValues.component !== 'RadioGroup'
  )
    cleanedValues.options = undefined

  cleanedValues.options = cleanedValues.options?.map(x => ({
    id: uuid(),
    ...x,
  }))
  cleanedValues.validate = cleanedValues.validate?.map(x => ({
    id: uuid(),
    ...x,
  }))

  return cleanedValues
}

const ComponentForm = ({
  category,
  field,
  formId,
  updateField,
  shouldAllowHypothesisTagging,
}) => {
  const [componentType, setComponentType] = useState(field.component)

  const component = components[componentType] || {}
  const defaults = {}
  Object.entries(component).forEach(([key, value]) => {
    const defaultValue = value?.defaultValue
    if (defaultValue !== undefined) defaults[key] = defaultValue
  })

  return (
    <Formik
      initialValues={{
        ...defaults,
        ...field,
      }}
      key={field.id}
      onSubmit={values =>
        updateField({
          variables: {
            formId,
            element: prepareForSubmit(values),
          },
        })
      }
    >
      {formikProps => (
        <ComponentProperties
          category={category}
          formErrors={formikProps.errors}
          onSubmit={formikProps.handleSubmit}
          selectedComponent={componentType}
          setComponentType={setComponentType}
          setFieldValue={formikProps.setFieldValue}
          shouldAllowHypothesisTagging={shouldAllowHypothesisTagging}
        />
      )}
    </Formik>
  )
}

ComponentForm.propTypes = {
  field: PropTypes.shape({
    id: PropTypes.string.isRequired,
    component: PropTypes.string,
  }).isRequired,
  formId: PropTypes.string.isRequired,
  updateField: PropTypes.func.isRequired,
}

export default ComponentForm
