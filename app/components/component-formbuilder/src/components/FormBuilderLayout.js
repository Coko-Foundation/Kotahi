import React from 'react'
import PropTypes from 'prop-types'
import { forEach } from 'lodash'
import styled, { withTheme } from 'styled-components'
import { Tabs, Action, Icon } from '@pubsweet/ui'
import { Columns, Details, Form } from './style'
import ComponentProperties from './ComponentProperties'
import FormProperties from './FormProperties'
import FormBuilder from './FormBuilder'
import {
  Container,
  HeadingWithAction,
  Heading,
  SectionContent,
  SectionRow,
} from '../../../shared'

const IconAction = styled(Action)`
  line-height: 1.15;
  vertical-align: text-top;
`

const RightIconAction = styled(IconAction)`
  margin-left: 10px;
`

const UnpaddedIcon = styled(Icon)`
  line-height: 1.15;
  padding: 0;
  vertical-align: text-top;
`

const ControlIcon = withTheme(({ children, theme }) => (
  <UnpaddedIcon color={theme.colorPrimary}>{children}</UnpaddedIcon>
))

const FormBuilderLayout = ({
  forms,
  activeFormId,
  activeFieldId,
  deleteForm,
  deleteField,
  moveFieldDown,
  moveFieldUp,
  updateForm,
  createForm,
  updateField,
  setActiveFieldId,
  setActiveFormId,
}) => {
  const sections = []
  forEach(forms, form => {
    sections.push({
      content: (
        <SectionContent>
          <SectionRow>
            <FormBuilder
              activeFieldId={activeFieldId}
              addField={updateField}
              deleteField={deleteField}
              form={form}
              moveFieldDown={fieldId => moveFieldDown(form, fieldId)}
              moveFieldUp={fieldId => moveFieldUp(form, fieldId)}
              setActiveFieldId={setActiveFieldId}
            />
          </SectionRow>
        </SectionContent>
      ),
      key: `${form.id}`,
      label: [
        form.structure.name,
        <RightIconAction
          key="delete-form"
          onClick={e => {
            e.preventDefault()
            e.stopPropagation()
            deleteForm({
              variables: { formId: form.id },
            })
            setActiveFormId(forms.find(f => f.id !== form.id)?.id ?? null)
          }}
        >
          <ControlIcon size={2.5}>x</ControlIcon>
        </RightIconAction>,
      ],
    })
  })

  sections.push({
    content: <SectionContent />,
    key: 'new',
    label: [
      <ControlIcon key="new-form" size={2.5}>
        plus
      </ControlIcon>,
      ' New Form',
    ],
  })

  const activeForm = forms.find(f => f.id === activeFormId) ?? {
    purpose: '',
    structure: {
      children: [],
      name: '',
      description: '',
      haspopup: 'false',
    },
  }

  const activeField = activeForm.structure.children.find(
    elem => elem.id === activeFieldId,
  )

  return (
    <Container>
      <HeadingWithAction>
        <Heading>Form Builder</Heading>
      </HeadingWithAction>
      <Columns>
        <Form>
          <Tabs
            activeKey={activeFormId ?? 'new'}
            key={activeFormId}
            onChange={tab => {
              setActiveFormId(tab)
              setActiveFieldId(null)
            }}
            sections={sections}
          />
        </Form>
        <Details>
          <SectionContent>
            <SectionRow>
              {activeField ? (
                <ComponentProperties
                  field={activeField}
                  formId={activeForm.id}
                  key={activeField.id}
                  updateField={updateField}
                />
              ) : (
                <FormProperties
                  createForm={createForm}
                  form={activeForm}
                  key={activeForm.id}
                  updateForm={updateForm}
                />
              )}
            </SectionRow>
          </SectionContent>
        </Details>
      </Columns>
    </Container>
  )
}

FormBuilderLayout.propTypes = {
  forms: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      purpose: PropTypes.string,
      structure: PropTypes.shape({
        children: PropTypes.arrayOf(
          PropTypes.shape({
            id: PropTypes.string.isRequired,
            component: PropTypes.string,
          }).isRequired,
        ).isRequired,
      }).isRequired,
    }).isRequired,
  ).isRequired,
  activeFormId: PropTypes.string.isRequired,
  activeFieldId: PropTypes.string,
  deleteForm: PropTypes.func.isRequired,
  deleteField: PropTypes.func.isRequired,
  moveFieldDown: PropTypes.func.isRequired,
  moveFieldUp: PropTypes.func.isRequired,
  updateForm: PropTypes.func.isRequired,
  createForm: PropTypes.func.isRequired,
  updateField: PropTypes.func.isRequired,
  setActiveFieldId: PropTypes.func.isRequired,
  setActiveFormId: PropTypes.func.isRequired,
}

FormBuilderLayout.defaultProps = {
  activeFieldId: null,
}

export default FormBuilderLayout
