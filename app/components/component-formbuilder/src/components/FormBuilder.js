import React, { useState } from 'react'
import PropTypes from 'prop-types'
import styled, { withTheme } from 'styled-components'
import { unescape } from 'lodash'
import { th, grid } from '@pubsweet/ui-toolkit'
import { Icon, Action, Button } from '@pubsweet/ui'
import { v4 as uuid } from 'uuid'

import { Page, Heading } from './style'
import lightenBy from '../../../../shared/lightenBy'
import Modal from '../../../component-modal/src/index'

const ModalContainer = styled.div`
  background: ${th('colorBackground')};
  padding: 20px 24px;
  z-index: 100;
`

const Element = styled.div`
  background-color: ${th('colorSecondaryBackground')};
  border-radius: ${th('borderRadius')};
  display: flex;
  justify-content: space-between;
  margin: ${grid(2)};
  padding: ${grid(1)};

  &.active {
    background-color: ${lightenBy('colorPrimary', 0.7)};
  }
`

const MainAction = styled(Action)`
  flex-grow: 1;
  text-align: left;
`

const IconAction = styled(Action)`
  flex-grow: 0;
  margin: 0 ${grid(1)};
`

const StatusIcon = withTheme(({ children, theme }) => (
  <Icon color={theme.colorPrimary}>{children}</Icon>
))

const UnpaddedIcon = styled(Icon)`
  padding: 0;
  vertical-align: text-top;
`

const SmallIcon = withTheme(({ children, theme }) => (
  <UnpaddedIcon color={theme.colorPrimary} size={2.5}>
    {children}
  </UnpaddedIcon>
))

const Status = styled.div`
  align-items: center;
  color: ${th('colorPrimary')};
  display: inline-flex;
`

const StatusIdle = styled(Status).attrs(props => ({
  children: <StatusIcon>plus_circle</StatusIcon>,
}))``

const Root = styled.div`
  display: flex;
  flex-direction: column;
  font-weight: 200;
  padding-bottom: 10px;
  padding-top: 10px;

  &:hover ${StatusIdle} {
    circle {
      fill: ${th('colorPrimary')};
      stroke: ${th('colorPrimary')};
    }

    line {
      stroke: white;
    }
  }
`

const Main = styled.div`
  display: flex;
  justify-content: center;
`

const ElementTitle = styled.span``

const CancelButton = styled(Button)`
  background: #e9ebe8;
  padding: 8px;
  text-decoration: none;

  &:hover {
    background: #dbdbdb;
  }
`

const ConfirmationString = styled.p`
  align-items: center;
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
  width: 100%;
`

const createMarkup = encodedHtml => ({
  __html: unescape(encodedHtml),
})

const BuilderElement = ({
  element,
  isActive,
  moveFieldDown,
  moveFieldUp,
  setActiveFieldId,
  deleteField,
  formId,
  formFeildId,
  handleDrag,
  handleDrop,
}) => {
  const [openModal, setOpenModal] = useState(false)
  const [formFieldId, setFormFieldId] = useState()

  const openModalHandler = id => {
    setOpenModal(true)
    setFormFieldId(id)
  }

  const closeModalHandler = () => {
    setOpenModal(false)
  }

  return (
    <div
      draggable
      id={formFeildId}
      onDragOver={ev => ev.preventDefault()}
      onDragStart={handleDrag}
      onDrop={e => handleDrop(e, element.id)}
    >
      <Element
        className={isActive ? 'active' : undefined}
        key={`element-${element.id}`}
        onClick={() => setActiveFieldId(element.id)}
      >
        <MainAction>
          <ElementTitle
            dangerouslySetInnerHTML={createMarkup(
              element.shortDescription ?? element.title,
            )}
          />{' '}
          ({element.component})
        </MainAction>
        <IconAction
          onClick={() =>
            openModalHandler({
              variables: { formId, elementId: element.id },
            })
          }
        >
          <SmallIcon>x</SmallIcon>
        </IconAction>
      </Element>

      <Modal isOpen={openModal}>
        <ModalContainer>
          <ConfirmationString>
            Permanently delete this field?
          </ConfirmationString>
          <Button
            onClick={event => {
              deleteField(formFieldId)
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

BuilderElement.propTypes = {
  element: PropTypes.shape({
    id: PropTypes.string.isRequired,
    shortDescription: PropTypes.string,
    title: PropTypes.string.isRequired,
    component: PropTypes.string,
  }).isRequired,
  isActive: PropTypes.bool.isRequired,
  moveFieldUp: PropTypes.func.isRequired,
  moveFieldDown: PropTypes.func.isRequired,
  setActiveFieldId: PropTypes.func.isRequired,
  deleteField: PropTypes.func.isRequired,
  formId: PropTypes.string.isRequired,
}

const AddElementButton = ({ addElement }) => (
  <Root>
    <Main>
      <Action
        onClick={() =>
          addElement({
            title: 'New Field',
            id: uuid(),
          })
        }
      >
        <Heading>
          <StatusIdle />
          Add Field
        </Heading>
      </Action>
    </Main>
  </Root>
)

AddElementButton.propTypes = {
  addElement: PropTypes.func.isRequired,
}

const FormBuilder = ({
  activeFieldId,
  form,
  setActiveFieldId,
  addField,
  deleteField,
  moveFieldUp,
  moveFieldDown,
  dragField,
}) => {
  const [dragId, setDragId] = useState()

  const handleDrag = ev => {
    setDragId(ev.currentTarget.id)
  }

  const handleDrop = (ev, id) => {
    dragField({ toDragid: id, fromDragid: dragId })
  }

  return (
    <Page>
      {form.structure.children?.map(element => (
        <BuilderElement
          deleteField={deleteField}
          element={element}
          formFeildId={element.id}
          formId={form.id}
          handleDrag={handleDrag}
          handleDrop={handleDrop}
          isActive={activeFieldId === element.id}
          key={`element-${element.id}`}
          moveFieldDown={moveFieldDown}
          moveFieldUp={moveFieldUp}
          setActiveFieldId={setActiveFieldId}
        />
      ))}
      <AddElementButton
        addElement={newElement => {
          addField({
            variables: { element: newElement, formId: form.id },
          })
          setActiveFieldId(newElement.id)
        }}
      />
    </Page>
  )
}

FormBuilder.propTypes = {
  activeFieldId: PropTypes.string,
  form: PropTypes.shape({
    id: PropTypes.string,
    purpose: PropTypes.string,
    structure: PropTypes.shape({
      children: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.string.isRequired,
          title: PropTypes.string.isRequired,
          component: PropTypes.string,
        }).isRequired,
      ).isRequired,
    }),
  }).isRequired,
  setActiveFieldId: PropTypes.func.isRequired,
  addField: PropTypes.func.isRequired,
  deleteField: PropTypes.func.isRequired,
  moveFieldUp: PropTypes.func.isRequired,
  moveFieldDown: PropTypes.func.isRequired,
}

FormBuilder.defaultProps = {
  activeFieldId: null,
}

export default FormBuilder
