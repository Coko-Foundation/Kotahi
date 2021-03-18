import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { isEmpty } from 'lodash'
import styled from 'styled-components'
import { Button, TextField, ValidatedFieldFormik } from '@pubsweet/ui'
import { th } from '@pubsweet/ui-toolkit'
import { AbstractField, RadioBox } from './builderComponents'
import { Page, Heading } from './style'

const nameText = input => <TextField {...input} />

const idText = input => <TextField {...input} />

export const Legend = styled.div`
  font-size: ${th('fontSizeBase')};
  font-weight: 600;
  margin-bottom: ${({ space, theme }) => space && theme.gridUnit};
`

export const Section = styled.div`
  margin: calc(${th('gridUnit')} * 6) 0;
`

const FormProperties = ({
  handleSubmit,
  mode,
  popup,
  properties,
  setFieldValue,
  setPopup,
}) =>
  isEmpty(properties) && mode !== 'create' ? ( // TODO Move this check to the wrapper so we don't have to pass in the entire properties just for this
    <Page>
      <span>&nbsp;</span>
    </Page>
  ) : (
    <Page>
      <form onSubmit={handleSubmit}>
        <Heading>{mode === 'create' ? 'Create Form' : 'Update Form'}</Heading>
        <Section id="form.id" key="form.id">
          <Legend>Form ID</Legend>
          <ValidatedFieldFormik component={idText} name="id" />
        </Section>
        <Section id="form.name" key="form.name">
          <Legend>Form Name</Legend>
          <ValidatedFieldFormik component={nameText} name="name" />
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
            <ValidatedFieldFormik component={nameText} name="popuptitle" />
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

FormProperties.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  mode: PropTypes.string.isRequired,
  popup: PropTypes.string.isRequired,
  properties: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    haspopup: PropTypes.string.isRequired,
    popuptitle: PropTypes.string,
    popupdescription: PropTypes.string,
  }).isRequired,
  setFieldValue: PropTypes.func.isRequired,
  setPopup: PropTypes.func.isRequired,
}

const FormPropertiesWrapper = ({
  onSubmit,
  mode,
  properties,
  setFieldValue,
}) => {
  const [popup, setPopup] = useState((properties || {}).haspopup)
  return (
    <FormProperties
      handleSubmit={onSubmit}
      mode={mode}
      popup={popup}
      properties={properties}
      setFieldValue={setFieldValue}
      setPopup={setPopup}
    />
  )
}

FormPropertiesWrapper.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  mode: PropTypes.string.isRequired,
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

export default FormPropertiesWrapper
