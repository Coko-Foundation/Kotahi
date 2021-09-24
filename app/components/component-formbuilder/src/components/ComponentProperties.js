import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { isEmpty, omitBy } from 'lodash'
import { Formik } from 'formik'
import { ValidatedFieldFormik, Menu, Button } from '@pubsweet/ui'
import { v4 as uuid } from 'uuid'
import components from './config/Elements'
import * as elements from './builderComponents'
import { Section, Legend, Page, Heading, DetailText } from './style'

const MenuComponents = input => (
  <Menu
    options={Object.keys(components).map(value => ({
      value,
      label: value,
    }))}
    {...input}
  />
)

const ComponentProperties = ({
  onSubmit,
  selectedComponent,
  setComponentType,
  setFieldValue,
}) => {
  const componentProperties = components[selectedComponent] ?? {}

  const editableProperties = Object.entries(componentProperties).filter(
    ([key, value]) => key !== 'id',
  )

  return (
    <Page key={selectedComponent}>
      <form onSubmit={onSubmit}>
        <Heading>Field Properties</Heading>
        <Section>
          <Legend space>Field type</Legend>
          <ValidatedFieldFormik
            component={MenuComponents}
            name="component"
            onChange={value => {
              setComponentType(value)
              setFieldValue('component', value)
            }}
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
        <Button primary type="submit">
          Update Field
        </Button>
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

const ComponentForm = ({ field, formId, updateField }) => {
  const [componentType, setComponentType] = useState(field.component)

  return (
    <Formik
      initialValues={{
        options: [],
        description: '',
        doiValidation: 'false',
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
          onSubmit={formikProps.handleSubmit}
          selectedComponent={componentType}
          setComponentType={setComponentType}
          setFieldValue={formikProps.setFieldValue}
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
