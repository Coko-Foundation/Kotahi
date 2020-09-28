import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { th, override } from '@pubsweet/ui-toolkit'

const Tab = styled.div`
  padding: ${th('gridUnit')} 1em;
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
  display: flex;
`

const TabContainer = styled.div.attrs(props => ({
  'data-test-id': props['data-test-id'] || 'tab-container',
}))``

const Content = styled.div``

const Tabs = ({ sections, onChange, defaultActiveKey = null }) => {
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
      <TabsContainer>
        {sections.map(({ key, label }) => (
          <TabContainer
            key={key}
            onClick={() => setActiveKeyAndCallOnChange(key)}
          >
            <Tab active={activeKey === key}>{label || key}</Tab>
          </TabContainer>
        ))}
      </TabsContainer>

      {activeKey && <Content>{currentContent}</Content>}
    </>
  )
}

export { Tabs }
