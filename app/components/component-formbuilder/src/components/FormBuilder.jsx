import React, { useState } from 'react'
import styled, { withTheme } from 'styled-components'
import { unescape } from 'lodash'
import { th, grid } from '@pubsweet/ui-toolkit'
import { Icon, Action } from '@pubsweet/ui'
import { Page, Heading } from './style'

const Element = styled.div`
  display: flex;
  border: 1px solid ${th('colorBorder')};
  padding: ${grid(2)} ${grid(1)};
  border-radius: ${th('borderRadius')};
  margin: ${grid(2)};
  justify-content: space-between;
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

const BuilderElement = ({ elements, setProperties, deleteFormElement, form }) =>
  [...elements]
    .sort((obj1, obj2) => parseInt(obj1.order, 10) - parseInt(obj2.order, 10))
    .map((value, key) => (
      <Element key={`element-${value.id}`}>
        <Action
          onClick={() =>
            setProperties({
              type: 'element',
              formId: form.id,
              properties: value,
            })
          }
        >
          <ElementTitle dangerouslySetInnerHTML={createMarkup(value.title)} /> (
          {value.component})
        </Action>
        <Action
          onClick={() =>
            deleteFormElement({
              variables: { formId: form.id, elementId: value.id },
            })
          }
        >
          x
        </Action>
      </Element>
    ))

const AddButtonElement = ({ addElement }) => (
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

const FormBuilder = ({
  form,
  // elements,
  // addElements,
  setProperties,
  deleteFormElement,
}) => {
  const [elements, setElements] = useState(form.children || [])
  const addElement = element => {
    setElements([...elements, element])
  }
  // const addElements = useCallback(() => {

  // })

  return (
    <Page>
      <AddButtonElement addElement={addElement} form={form} id="add-element" />
      {elements && elements.length > 0 && (
        <BuilderElement
          deleteFormElement={deleteFormElement}
          elements={elements}
          form={form}
          id="builder-element"
          setProperties={setProperties}
        />
      )}
    </Page>
  )
}

export default FormBuilder
