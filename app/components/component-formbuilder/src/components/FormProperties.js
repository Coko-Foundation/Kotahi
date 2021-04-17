import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { isEmpty, omitBy } from 'lodash'
import styled from 'styled-components'
import { Button, TextField, ValidatedFieldFormik } from '@pubsweet/ui'
import { th } from '@pubsweet/ui-toolkit'
import { Formik } from 'formik'
import { AbstractField, RadioBox } from './builderComponents'
import { Page, Heading } from './style'

export const Legend = styled.div`
  font-size: ${th('fontSizeBase')};
  font-weight: 600;
  margin-bottom: ${({ space, theme }) => space && theme.gridUnit};
`

export const Section = styled.div`
  margin: calc(${th('gridUnit')} * 6) 0;
`

const FormProperties = ({
  onSubmit,
  mode,
  purpose,
  setFieldValue,
  structure,
}) => {
  const [popup, setPopup] = useState(structure.haspopup)

  return isEmpty(structure) && mode !== 'create' ? (
    <Page>
      <span>&nbsp;</span>
    </Page>
  ) : (
    <Page>
      <form onSubmit={onSubmit}>
        <Heading>{mode === 'create' ? 'Create Form' : 'Update Form'}</Heading>
        <Section id="form.purpose" key="form.purpose">
          <Legend>Form purpose identifier</Legend>
          <ValidatedFieldFormik component={TextField} name="purpose" />
        </Section>
        <Section id="form.name" key="form.name">
          <Legend>Form Name</Legend>
          <ValidatedFieldFormik component={TextField} name="name" />
        </Section>
        <Section id="form.description" key="form.description">
          <Legend>Description</Legend>
          <ValidatedFieldFormik
            component={AbstractField.default}
            name="description"
            onChange={val => {
              setFieldValue('description', val)
            }}
          />
        </Section>
        <Section id="form.submitpopup" key="form.submitpopup">
          <Legend>Submit on Popup</Legend>
          <ValidatedFieldFormik
            component={RadioBox.default}
            inline
            name="haspopup"
            onChange={(input, value) => {
              setFieldValue('haspopup', input)
              setPopup(input)
            }}
            options={[
              {
                label: 'Yes',
                value: 'true',
              },
              {
                label: 'No',
                value: 'false',
              },
            ]}
          />
        </Section>
        {popup === 'true' && [
          <Section id="popup.title" key="popup.title">
            <Legend>Popup Title</Legend>
            <ValidatedFieldFormik component={TextField} name="popuptitle" />
          </Section>,
          <Section id="popup.description" key="popup.description">
            <Legend>Description</Legend>
            <ValidatedFieldFormik
              component={AbstractField.default}
              name="popupdescription"
              onChange={val => {
                setFieldValue('popupdescription', val)
              }}
            />
          </Section>,
        ]}
        <Button primary type="submit">
          {mode === 'create' ? 'Create Form' : 'Update Form'}
        </Button>
      </form>
    </Page>
  )
}

FormProperties.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  mode: PropTypes.string.isRequired,
  purpose: PropTypes.string.isRequired,
  structure: PropTypes.shape({
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
  if (
    cleanedValues.component !== 'Select' &&
    cleanedValues.component !== 'CheckboxGroup' &&
    cleanedValues.component !== 'RadioGroup'
  )
    cleanedValues.options = undefined

  return cleanedValues
}

const FormForm = ({ form, updateForm }) => {
  return (
    <Formik
      initialValues={{
        description: '',
        popupdescription: '',
        doiValidation: 'false',
        ...form.structure,
        purpose: form.purpose,
      }}
      onSubmit={values =>
        updateForm({
          variables: { form: prepareForSubmit(values) },
        })
      }
    >
      {formikProps => (
        <FormProperties
          mode="update"
          onSubmit={formikProps.handleSubmit}
          purpose={form.purpose}
          setFieldValue={formikProps.setFieldValue}
          structure={form.structure}
        />
      )}
    </Formik>
  )
}

FormForm.propTypes = {
  form: PropTypes.shape({
    structure: PropTypes.shape({
      name: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      haspopup: PropTypes.string.isRequired,
      popuptitle: PropTypes.string,
      popupdescription: PropTypes.string,
    }).isRequired,
    purpose: PropTypes.string.isRequired,
  }).isRequired,
  updateForm: PropTypes.func.isRequired,
}

export default FormForm
