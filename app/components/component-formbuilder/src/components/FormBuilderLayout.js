import React from 'react'
import PropTypes from 'prop-types'
import { forEach } from 'lodash'
import styled from 'styled-components'
import { Tabs, Action } from '@pubsweet/ui'
import { Columns, Details, Form } from './style'
import ComponentProperties from './ComponentProperties'
import FormBuilder from './FormBuilder'
import {
  Container,
  HeadingWithAction,
  Heading,
  SectionContent,
  SectionRow,
} from '../../../shared'

const DeleteIcon = styled(Action)`
  line-height: 1.15;
  margin-left: 10px;
`

const FormBuilderLayout = ({
  forms,
  activeFormId,
  activeFieldId,
  deleteForm,
  deleteFormElement,
  updateForm,
  createForm,
  updateFormElement,
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
              addFormElement={updateFormElement}
              deleteFormElement={deleteFormElement}
              form={form}
              setActiveFieldId={setActiveFieldId}
            />
          </SectionRow>
        </SectionContent>
      ),
      key: `${form.id}`,
      label: [
        form.name,
        <DeleteIcon
          key="delete-form"
          onClick={e => {
            e.preventDefault()
            e.stopPropagation()
            deleteForm({
              variables: { formId: form.id },
            })
            setActiveFormId(forms.find(f => f.id !== form.id)?.id ?? 'new')
          }}
        >
          🗙
        </DeleteIcon>,
      ],
    })
  })

  sections.push({
    content: <SectionContent />,
    key: 'new',
    label: '✚ Add Form',
  })

  const activeForm = forms.find(f => f.id === activeFormId) ?? {
    children: [],
    id: '',
    name: '',
    description: '',
    haspopup: 'false',
  }

  const activeField = activeForm.children.find(
    elem => elem.id === activeFieldId,
  )

  const fieldOrForm = activeField ?? activeForm

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
              <ComponentProperties
                fieldOrForm={fieldOrForm}
                formId={activeForm.id}
                isField={!!activeField}
                key={fieldOrForm.id}
                updateForm={updateForm}
                updateFormElement={updateFormElement}
              />
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
      children: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.string.isRequired,
          component: PropTypes.string,
        }).isRequired,
      ).isRequired,
    }).isRequired,
  ).isRequired,
  activeFormId: PropTypes.string.isRequired,
  activeFieldId: PropTypes.string,
  deleteForm: PropTypes.func.isRequired,
  deleteFormElement: PropTypes.func.isRequired,
  updateForm: PropTypes.func.isRequired,
  createForm: PropTypes.func.isRequired,
  updateFormElement: PropTypes.func.isRequired,
  setActiveFieldId: PropTypes.func.isRequired,
  setActiveFormId: PropTypes.func.isRequired,
}

FormBuilderLayout.defaultProps = {
  activeFieldId: null,
}

export default FormBuilderLayout
