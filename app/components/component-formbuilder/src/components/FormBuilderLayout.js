import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { forEach } from 'lodash'
import styled, { withTheme } from 'styled-components'
import { Tabs, Action, Icon, Button } from '@pubsweet/ui'
import { th } from '@pubsweet/ui-toolkit'
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
import Modal from '../../../component-modal/src/index'

const ModalContainer = styled.div`
  background: ${th('colorBackground')};
  padding: 20px 24px;
  z-index: 100;
`

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

const CancelButton = styled(Button)`
  background: #e9ebe8;
  padding: 8px;
  text-decoration: none;

  &:hover {
    background: #dbdbdb;
  }
`

const ConfrimationString = styled.p`
  align-items: center;
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
  width: 100%;
`

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
  const [openModal, setOpenModal] = useState(false)
  const [formId, setFormId] = useState()

  const openModalHandler = id => {
    setOpenModal(true)
    setFormId(id)
  }

  const closeModalHandler = () => {
    setOpenModal(false)
  }

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
        form.structure.name || 'Unnamed form',
        <RightIconAction
          key="delete-form"
          onClick={e => {
            e.preventDefault()
            e.stopPropagation()
            openModalHandler({
              variables: { formId: form.id },
            })
            setActiveFormId(forms.find(f => f.id !== form.id)?.id ?? 'new')
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
    <div>
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

      <Modal isOpen={openModal}>
        <ModalContainer>
          <ConfrimationString>Permanently delete this form?</ConfrimationString>
          <Button
            onClick={event => {
              deleteForm(formId)
              closeModalHandler()
            }}
            primary
          >
            Ok
          </Button>
          &nbsp;
          <CancelButton onClick={() => closeModalHandler()}>
            Cancel
          </CancelButton>
        </ModalContainer>
      </Modal>
    </div>
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
