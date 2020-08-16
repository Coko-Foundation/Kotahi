import React, { useState } from 'react'
import { map, omitBy } from 'lodash'
// import {
//   branch,
//   renderComponent,
//   compose,
//   withState,
//   withHandlers,
//   withProps,
// } from 'recompose'
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
  properties,
  setComponent,
  selectedComponent,
  handleSubmit,
  setFieldValue,
}) => (
  <Page>
    <form onSubmit={handleSubmit}>
      <Heading>Component Properties</Heading>
      <Section>
        <Legend space>Choose Component</Legend>
        <ValidatedFieldFormik
          component={MenuComponents}
          name="component"
          onChange={value => {
            setComponent(value)
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
              onChange={event => {
                let value = {}
                if (event.target) {
                  // eslint-disable-next-line prefer-destructuring
                  value = event.target.value
                } else {
                  value = event
                }
                setFieldValue(key, value)
              }}
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

const UpdateForm = ({ handleSubmit, properties, setFieldValue }) => (
  <FormProperties
    handleSubmit={handleSubmit}
    mode="update"
    properties={properties}
    setFieldValue={setFieldValue}
  />
)

const prepareForSubmit = values => {
  const cleanedValues = omitBy(values, value => value === '')
  return JSON.stringify(cleanedValues)
}

// const ComponentForm = compose(
// withProps(({ properties }) => ({
//   initialValues: { children: properties.properties },
// })),
// withFormik({
//   displayName: 'ComponentSubmit',
//   mapPropsToValues: data => data.properties.properties,
//   handleSubmit: (props, { props: { onSubmitFn, id, properties } }) =>
//     onSubmit(props, { onSubmitFn, properties }),
// }),
// withState(
//   'selectComponentValue',
//   'selectComponent',
//   ({ properties }) => properties.properties.component,
// ),
// withHandlers({
//   changeComponent: ({ selectComponent }) => component =>
//     selectComponent(() => component),
// }),
// )(ComponentProperties)

// export default compose(
//   branch(
//     ({ properties }) => properties.type === 'form',
//     renderComponent(UpdateForm),
//   )(ComponentForm),
// )

const ComponentForm = ({ updateForm, updateFormElement, ...props }) => {
  const [selectedComponent, setComponent] = useState(
    props.properties.properties.component,
  )
  return props.properties.type === 'form' ? (
    <Formik
      initialValues={props.properties.properties}
      onSubmit={values =>
        updateForm({
          variables: { formId: values.id, form: prepareForSubmit(values) },
        })
      }
    >
      {formikProps => (
        <UpdateForm
          handleSubmit={formikProps.handleSubmit}
          properties={props.properties}
          setFieldValue={formikProps.setFieldValue}
        />
      )}
    </Formik>
  ) : (
    <Formik
      initialValues={props.properties.properties}
      onSubmit={values =>
        updateFormElement({
          variables: {
            formId: props.properties.formId,
            element: prepareForSubmit(values),
          },
        })
      }
    >
      {formikProps => (
        <ComponentProperties
          displayName="ComponentSubmit"
          handleSubmit={formikProps.handleSubmit}
          selectedComponent={selectedComponent}
          setComponent={setComponent}
          setFieldValue={formikProps.setFieldValue}
        />
      )}
    </Formik>
  )
}

export default ComponentForm
