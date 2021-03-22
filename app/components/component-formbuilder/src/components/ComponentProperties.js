import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { map, omitBy } from 'lodash'
import { ValidatedFieldFormik, Menu, Button } from '@pubsweet/ui'
import { Formik } from 'formik'
import FormProperties from './FormProperties'
import components from './config/Elements'
import * as elements from './builderComponents'
import { Section, Legend, Page, Heading } from './style'

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
}) => (
  <Page>
    <form onSubmit={onSubmit}>
      <Heading>Component Properties</Heading>
      <Section>
        <Legend space>Component Type</Legend>
        <ValidatedFieldFormik
          component={MenuComponents}
          name="component"
          onChange={value => {
            setComponentType(value)
            setFieldValue('component', value)
          }}
        />
      </Section>
      {selectedComponent &&
        map(components[selectedComponent], (value, key) => (
          <Section key={key}>
            <Legend space>{`Field ${key}`}</Legend>
            <ValidatedFieldFormik
              component={elements[value.component].default}
              key={`${selectedComponent}-${key}`}
              name={key}
              onChange={val =>
                setFieldValue(key, val.target ? val.target.value : val)
              }
              {...value.props}
            />
          </Section>
        ))}
      <Button primary type="submit">
        Update Component
      </Button>
    </form>
  </Page>
)

ComponentProperties.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  selectedComponent: PropTypes.string,
  setComponentType: PropTypes.func.isRequired,
  setFieldValue: PropTypes.func.isRequired,
}

ComponentProperties.defaultProps = {
  selectedComponent: null,
}

const UpdateForm = ({ onSubmit, properties, setFieldValue }) => (
  <FormProperties
    mode="update"
    onSubmit={onSubmit}
    properties={properties}
    setFieldValue={setFieldValue}
  />
)

UpdateForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  properties: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    haspopup: PropTypes.string.isRequired,
    popuptitle: PropTypes.string,
    popupdescription: PropTypes.string,
  }).isRequired,
  setFieldValue: PropTypes.func.isRequired,
}

const prepareForSubmit = values => {
  const cleanedValues = omitBy(values, value => value === '')
  return JSON.stringify(cleanedValues)
}

const ComponentForm = ({
  fieldOrForm,
  isField,
  formId,
  updateForm,
  updateField,
}) => {
  const [componentType, setComponentType] = useState(fieldOrForm.component)

  if (!isField)
    return (
      <Formik
        initialValues={fieldOrForm}
        onSubmit={values =>
          updateForm({
            variables: { formId: values.id, form: prepareForSubmit(values) },
          })
        }
      >
        {formikProps => (
          <UpdateForm
            onSubmit={formikProps.handleSubmit}
            properties={fieldOrForm}
            setFieldValue={formikProps.setFieldValue}
          />
        )}
      </Formik>
    )

  return (
    <Formik
      initialValues={{ options: [], ...fieldOrForm }}
      key={fieldOrForm.id}
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
  fieldOrForm: PropTypes.shape({
    id: PropTypes.string.isRequired,
    component: PropTypes.string,
  }).isRequired,
  isField: PropTypes.bool.isRequired,
  formId: PropTypes.string.isRequired,
  updateForm: PropTypes.func.isRequired,
  updateField: PropTypes.func.isRequired,
}

export default ComponentForm
