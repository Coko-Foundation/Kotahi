import React, { useContext, useState } from 'react'
import PropTypes from 'prop-types'
import { isEmpty, omitBy } from 'lodash'
import styled from 'styled-components'
import { Button, TextField, ValidatedFieldFormik } from '@pubsweet/ui'
import { th } from '@pubsweet/ui-toolkit'
import { Formik } from 'formik'
import { useTranslation } from 'react-i18next'
import { AbstractField, RadioBox } from './builderComponents'
import { Page, Heading } from './style'
import { ConfigContext } from '../../../config/src'

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
  const { t } = useTranslation()
  return isEmpty(structure) && mode !== 'create' ? (
    <Page>
      <span>&nbsp;</span>
    </Page>
  ) : (
    <Page>
      <form onSubmit={onSubmit}>
        <Heading>
          {mode === 'create'
            ? t('formBuilder.Create Form')
            : t('formBuilder.Update Form')}
        </Heading>
        <Section id="form.purpose" key="form.purpose">
          <Legend>{t('formBuilder.Form purpose identifier')}</Legend>
          <ValidatedFieldFormik component={TextField} name="purpose" required />
        </Section>
        <Section id="form.name" key="form.name">
          <Legend>{t('formBuilder.Form Name')}</Legend>
          <ValidatedFieldFormik component={TextField} name="name" required />
        </Section>
        <Section id="form.description" key="form.description">
          <Legend>{t('formBuilder.Description')}</Legend>
          <ValidatedFieldFormik
            component={AbstractField.default}
            name="description"
            onChange={val => {
              setFieldValue('description', val)
            }}
          />
        </Section>
        <Section id="form.submitpopup" key="form.submitpopup">
          <Legend>{t('formBuilder.Submit on Popup')}</Legend>
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
                label: t('formBuilder.submitYes'),
                value: 'true',
              },
              {
                label: t('formBuilder.submitNo'),
                value: 'false',
              },
            ]}
          />
        </Section>
        {popup === 'true' && [
          <Section id="popup.title" key="popup.title">
            <Legend>{t('formBuilder.Popup Title')}</Legend>
            <ValidatedFieldFormik component={TextField} name="popuptitle" />
          </Section>,
          <Section id="popup.description" key="popup.description">
            <Legend>{t('formBuilder.Description')}</Legend>
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
          {mode === 'create'
            ? t('formBuilder.Create Form')
            : t('formBuilder.Update Form')}
        </Button>
      </form>
    </Page>
  )
}

FormProperties.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  mode: PropTypes.string.isRequired,
  purpose: PropTypes.string,
  structure: PropTypes.shape({
    name: PropTypes.string,
    description: PropTypes.string,
    haspopup: PropTypes.string.isRequired,
    popuptitle: PropTypes.string,
    popupdescription: PropTypes.string,
  }).isRequired,
  setFieldValue: PropTypes.func.isRequired,
}

FormProperties.defaultProps = {
  purpose: '',
}

const prepareForSubmit = (form, values, config) => {
  const cleanedValues = omitBy(values, value => value === '')

  const { purpose, created, updated, ...rest } = cleanedValues

  const newForm = {
    id: form.id,
    purpose,
    category: form.category,
    structure: rest,
    groupId: config.groupId,
  }

  return newForm
}

const FormForm = ({ form, updateForm, createForm }) => {
  const config = useContext(ConfigContext)
  return (
    <Formik
      initialValues={{
        description: '',
        popupdescription: '',
        ...form.structure,
        purpose: form.purpose,
      }}
      onSubmit={(values, actions) => {
        if (form.id) {
          updateForm({
            variables: { form: prepareForSubmit(form, values, config) },
          })
        } else {
          createForm({
            variables: { form: prepareForSubmit(form, values, config) },
          })
          actions.resetForm()
        }
      }}
    >
      {formikProps => (
        <FormProperties
          mode={form.id ? 'update' : 'create'}
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
    id: PropTypes.string,
    structure: PropTypes.shape({
      name: PropTypes.string,
      description: PropTypes.string,
      haspopup: PropTypes.string.isRequired,
      popuptitle: PropTypes.string,
      popupdescription: PropTypes.string,
    }).isRequired,
    purpose: PropTypes.string,
  }).isRequired,
  updateForm: PropTypes.func.isRequired,
  createForm: PropTypes.func.isRequired,
}

export default FormForm
