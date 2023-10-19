import React, { useState } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { isEmpty, omitBy } from 'lodash'
import { Formik } from 'formik'
import { ValidatedFieldFormik, Menu, Button } from '@pubsweet/ui'
import { th } from '@pubsweet/ui-toolkit'
import { v4 as uuid } from 'uuid'
import { useTranslation } from 'react-i18next'
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
      key !== 'id' && (key !== 'publishingTag' || shouldAllowHypothesisTagging),
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

  const { t } = useTranslation()

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

  // localize options
  componentTypeOptions = componentTypeOptions.map(typeOption => {
    const newOption = { ...typeOption }
    newOption.label = t(`formBuilder.typeOptions.${typeOption.value}`)
    return newOption
  })

  let editableProperties = getEditableComponentProperties(
    selectedComponent,
    category,
    shouldAllowHypothesisTagging,
  )

  const formIsValid = !Object.keys(formErrors).length

  // localize editableProps
  editableProperties = editableProperties.map(([key, prop]) => {
    const newProp = { ...prop }

    if (newProp.component === 'RadioBox' || newProp.component === 'Menu') {
      newProp.props.options = prop.props.options.map(option => {
        const newOption = { ...option }
        newOption.label = t(`fields.${key}.${option.value}`)
        return newOption
      })
    }

    return [key, newProp]
  })

  return (
    <Page key={selectedComponent}>
      <form onSubmit={onSubmit}>
        <Heading>{t('formBuilder.Field Properties')}</Heading>
        <Section>
          <Legend space>{t('formBuilder.Field type')}</Legend>
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
            <Legend space>
              {/* {value.props?.label ?? `Field ${key}`} */}
              {t(
                `formBuilder.Field ${key}`,
                value.props?.label ?? `Field ${key}`,
              )}
            </Legend>

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
              <DetailText>
                {t(
                  `formBuilder.FieldDescription ${key}`,
                  value.props.description,
                )}
              </DetailText>
            )}
          </Section>
        ))}
        <Button disabled={!formIsValid} primary type="submit">
          {t('formBuilder.Update Field')}
        </Button>
        {!formIsValid && (
          <InvalidWarning>
            {t('formBuilder.Correct invalid values before updating')}
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
