import React from 'react'
import PropTypes from 'prop-types'
import styled, { withTheme } from 'styled-components'
import { unescape } from 'lodash'
import { th, grid } from '@pubsweet/ui-toolkit'
import { Icon, Action } from '@pubsweet/ui'
import { Page, Heading } from './style'

const Element = styled.div`
  background-color: ${th('colorSecondaryBackground')};
  border-radius: ${th('borderRadius')};
  display: flex;
  justify-content: space-between;
  margin: ${grid(2)};
  padding: ${grid(1)};

  &.active {
    background-color: ${th('colorSelected')};
  }
`

const StatusIcon = withTheme(({ children, theme }) => (
  <Icon color={theme.colorPrimary}>{children}</Icon>
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

const createMarkup = encodedHtml => ({
  __html: unescape(encodedHtml),
})

const BuilderElement = ({
  element,
  isActive,
  setActiveFieldId,
  deleteFormElement,
  formId,
}) => {
  return (
    <Element
      className={isActive ? 'active' : undefined}
      key={`element-${element.id}`}
      onClick={() => setActiveFieldId(element.id)}
    >
      <Action>
        <ElementTitle
          dangerouslySetInnerHTML={createMarkup(
            element.shortDescription ?? element.title,
          )}
        />{' '}
        ({element.component})
      </Action>
      <Action
        onClick={event => {
          event.stopPropagation()
          deleteFormElement({
            variables: { formId, elementId: element.id },
          })
        }}
      >
        🗙
      </Action>
    </Element>
  )
}

BuilderElement.propTypes = {
  element: PropTypes.shape({
    id: PropTypes.string.isRequired,
    shortDescription: PropTypes.string,
    title: PropTypes.string.isRequired,
    component: PropTypes.string,
    order: PropTypes.string,
  }).isRequired,
  isActive: PropTypes.bool.isRequired,
  setActiveFieldId: PropTypes.func.isRequired,
  deleteFormElement: PropTypes.func.isRequired,
  formId: PropTypes.string.isRequired,
}

const AddElementButton = ({ addElement }) => (
  <Root>
    <Main>
      <Action
        onClick={() =>
          addElement({
            title: 'New Component',
            id: `${Date.now()}`,
          })
        }
      >
        <Heading>
          <StatusIdle />
          Add Element
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
  addFormElement,
  deleteFormElement,
}) => {
  const orderedElements = [...form.children].sort(
    (obj1, obj2) => parseInt(obj1.order, 10) - parseInt(obj2.order, 10),
  )

  return (
    <Page>
      {orderedElements.map(element => (
        <BuilderElement
          deleteFormElement={deleteFormElement}
          element={element}
          formId={form.id}
          isActive={activeFieldId === element.id}
          key={`element-${element.id}`}
          setActiveFieldId={setActiveFieldId}
        />
      ))}
      <AddElementButton
        addElement={newElement => {
          addFormElement({
            variables: { element: JSON.stringify(newElement), formId: form.id },
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
    id: PropTypes.string.isRequired,
    children: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        component: PropTypes.string,
        order: PropTypes.string,
      }).isRequired,
    ).isRequired,
  }).isRequired,
  setActiveFieldId: PropTypes.func.isRequired,
  addFormElement: PropTypes.func.isRequired,
  deleteFormElement: PropTypes.func.isRequired,
}

FormBuilder.defaultProps = {
  activeFieldId: null,
}

export default FormBuilder
