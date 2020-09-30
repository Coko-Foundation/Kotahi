import React, { useState, useEffect } from 'react'
import styled, { css } from 'styled-components'
import { th, override } from '@pubsweet/ui-toolkit'

const Tab = styled.div`
  padding: calc(${th('gridUnit')} - 1px) 1em;
  font-size: ${th('fontSizeBaseSmall')};
  font-weight: 500;
  background-color: ${({ active }) =>
    active ? th('colorBackground') : th('colorFurniture')};
  border-radius: ${th('borderRadius')} ${th('borderRadius')} 0 0;
  border-bottom: 2px solid
    ${({ active }) => (active ? th('colorPrimary') : th('colorFurniture'))};
  color: ${({ active }) => (active ? th('colorPrimary') : th('colorText'))};
  cursor: pointer;
  ${override('ui.Tab')};
`

const TabsContainer = styled.div`
  ${props =>
    props.background &&
    css`
      background-color: ${th(props.background)};
    `}
  display: flex;
  ${props =>
    props.gridArea &&
    css`
      grid-area: ${props.gridArea};
    `}
`

const TabContainer = styled.div.attrs(props => ({
  'data-test-id': props['data-test-id'] || 'tab-container',
}))``

const Tabs = ({
  sections,
  onChange,
  defaultActiveKey = null,
  tabsContainerGridArea,
  background,
}) => {
  const [activeKey, setActiveKey] = useState(defaultActiveKey)

  useEffect(() => {
    setActiveKey(defaultActiveKey)
  }, [defaultActiveKey])

  const setActiveKeyAndCallOnChange = activeKey => {
    setActiveKey(activeKey)
    if (typeof onChange === 'function') {
      onChange(activeKey)
    }
  }

  const currentContent = (
    sections.find(section => section.key === activeKey) || {}
  ).content
  return (
    <>
      <TabsContainer background={background} gridArea={tabsContainerGridArea}>
        {sections.map(({ key, label }) => (
          <TabContainer
            key={key}
            onClick={() => setActiveKeyAndCallOnChange(key)}
          >
            <Tab active={activeKey === key}>{label || key}</Tab>
          </TabContainer>
        ))}
      </TabsContainer>

      {activeKey && currentContent}
    </>
  )
}

export { Tabs }
