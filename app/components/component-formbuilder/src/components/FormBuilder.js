import React, { useState } from 'react'
import PropTypes from 'prop-types'
import styled, { withTheme } from 'styled-components'
import { th, grid } from '@pubsweet/ui-toolkit'
import { Icon, Action, Button } from '@pubsweet/ui'
import { v4 as uuid } from 'uuid'
import { Draggable } from 'react-beautiful-dnd'

import { Page, Heading } from './style'
import { DragVerticalIcon } from '../../../shared/Icons'
import Modal from '../../../component-modal/src/ConfirmationModal'
import { color } from '../../../../theme'

const ModalContainer = styled.div`
  background: ${color.backgroundA};
  padding: 20px 24px;
  z-index: 100;
`

const FeildWrapper = styled.div`
  align-items: center;
  border-radius: ${th('borderRadius')};
  display: flex;
  padding: ${grid(0.5)};

  &.active {
    background-color: ${color.brand1.tint70};
  }

  &:hover svg:first-child {
    stroke: ${color.brand1.base};
  }
`

const Element = styled.div`
  background-color: ${color.backgroundB};
  border-radius: ${th('borderRadius')};
  display: flex;
  justify-content: space-between;
  width: 100%;

  &.active {
    background-color: ${color.brand1.tint70};
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
  <Icon color={color.brand1.base()}>{children}</Icon>
))

const DragIcon = styled(DragVerticalIcon)`
  height: 20px;
  margin-right: ${grid(1)};
  stroke: transparent;
  width: 20px;
`

const UnpaddedIcon = styled(Icon)`
  padding: 0;
  vertical-align: text-top;
`

const SmallIcon = withTheme(({ children, theme }) => (
  <UnpaddedIcon color={color.brand1.base()} size={2.5}>
    {children}
  </UnpaddedIcon>
))

const Status = styled.div`
  align-items: center;
  color: ${color.brand1.base};
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
      fill: ${color.brand1.base};
      stroke: ${color.brand1.base};
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

const CancelButton = styled(Button)`
  background: ${color.gray90};
  padding: 8px;
  text-decoration: none;

  &:hover {
    background: ${color.gray80};
  }
`

const ConfirmationString = styled.p`
  align-items: center;
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
  width: 100%;
`

const BuilderElement = ({
  element,
  isActive,
  moveFieldDown,
  moveFieldUp,
  setActiveFieldId,
  deleteField,
  formId,
  formFeildId,
  index,
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

  const getItemStyle = (isDragging, draggableStyle) => ({
    ...draggableStyle,
    margin: `0px 0px calc(8px * 3)`,
  })

  return (
    <Draggable draggableId={formFeildId} index={index} key={formFeildId}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={getItemStyle(
            snapshot.isDragging,
            provided.draggableProps.style,
          )}
        >
          <FeildWrapper
            className={isActive || snapshot.isDragging ? 'active' : undefined}
            id={formFeildId}
            style={{
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <DragIcon />
            <Element
              className={isActive || snapshot.isDragging ? 'active' : undefined}
              key={`element-${element.id}`}
              onClick={() => setActiveFieldId(element.id)}
            >
              <MainAction>
                {element.shortDescription ?? element.title} ({element.component}
                )
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
          </FeildWrapper>
        </div>
      )}
    </Draggable>
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
}) => {
  return (
    <Page>
      {form.structure.children?.map((element, index) => (
        <BuilderElement
          deleteField={deleteField}
          element={element}
          formFeildId={element.id}
          formId={form.id}
          index={index}
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
