import React from 'react'
import {
  compose,
  withState,
  withHandlers,
  lifecycle,
  // setDisplayName,
} from 'recompose'
import styled, { withTheme } from 'styled-components'
import { unescape } from 'lodash'
import { th } from '@pubsweet/ui-toolkit'
import { Icon, Action } from '@pubsweet/ui'
import { Page } from './molecules/Page'

const Element = styled.div`
  display: flex;
  border: 1px solid #000;
  padding: 10px;
  margin: 10px;
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

const StatusIdle = styled(Status).attrs({
  children: () => <StatusIcon>plus_circle</StatusIcon>,
})``

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

const Info = styled.div`
  color: ${th('colorPrimary')};
  font-size: 2em;
  font-weight: 400;
  text-transform: uppercase;
  display: inline-flex;
  padding: calc(8px / 2);
`

const ElementTitle = styled.span``

const createMarkup = encodedHtml => ({
  __html: unescape(encodedHtml),
})

const BuilderElement = ({ elements, changeProperties, deleteElement, form }) =>
  elements.map((value, key) => (
    <Element key={`element-${value.id}`}>
      <Action
        onClick={() =>
          changeProperties({
            type: 'element',
            properties: value,
          })
        }
      >
        <ElementTitle dangerouslySetInnerHTML={createMarkup(value.title)} /> (
        {value.component})
      </Action>
      <Action onClick={() => deleteElement(form.id, value.id)}>x</Action>
    </Element>
  ))

const AddButtonElement = ({ addElements }) => (
  <Root>
    <Main>
      <Action
        onClick={() =>
          addElements({
            title: 'New Component',
            id: `${Date.now()}`,
          })
        }
      >
        <StatusIdle />
        <Info>Add Element</Info>
      </Action>
    </Main>
  </Root>
)

const FormBuilder = ({
  form,
  elements,
  addElements,
  changeProperties,
  deleteElement,
}) => (
  <Page>
    <AddButtonElement addElements={addElements} form={form} id="add-element" />
    {elements && elements.length > 0 && (
      <BuilderElement
        changeProperties={changeProperties}
        deleteElement={deleteElement}
        elements={elements}
        form={form}
        id="builder-element"
      />
    )}
  </Page>
)

FormBuilder.displayName = 'FormBuilder'

export default compose(
  withState('elements', 'onAddElements', ({ form }) => form.children || []),
  withHandlers({
    addElements: ({ onAddElements, form }) => addElement =>
      onAddElements(() => {
        const addEl = { children: form.children || [] }
        addEl.children = [...addEl.children, addElement]
        return addEl.children
      }),
  }),
  lifecycle({
    componentWillReceiveProps(nextProps) {
      if (this.props.form.children !== nextProps.form.children) {
        this.setState({ elements: nextProps.form.children })
      }

      if (this.props.elements !== nextProps.elements) {
        this.setState({ elements: nextProps.elements })
      }
    },
  }),
)(FormBuilder)
