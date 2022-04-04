import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { th, override } from '@pubsweet/ui-toolkit'
import lightenBy from '../../shared/lightenBy'
import { TabsContainer } from './Tabs'

const Tab = styled.div`
  background-color: ${({ active }) =>
    active ? lightenBy('colorPrimary', 0.6) : th('colorFurniture')};
  border-bottom: 2px solid
    ${({ active }) => (active ? th('colorPrimary') : th('colorFurniture'))};
  border-radius: ${th('borderRadius')} ${th('borderRadius')} 0 0;
  color: ${th('colorText')};
  cursor: pointer;
  font-size: ${th('fontSizeBaseSmall')};
  font-weight: 500;
  padding: calc(${th('gridUnit')} - 1px) 1em;

  /* stylelint-disable-next-line order/properties-alphabetical-order */
  ${override('ui.Tab')}
`

const HiddenTabsContainer = styled(TabsContainer)`
  ${props => props.sticky && `background-color: ${th('colorBackgroundHue')};`}
  ${props => props.sticky && 'position: sticky;'}
  ${props => props.sticky && 'top: -16px;'}
  ${props => props.sticky && 'z-index: 999;'}

  & ~ div .waxmenu {
    ${props => props.sticky && 'top: 23px;'};
  }
`

const TabContainer = styled.div.attrs(props => ({
  'data-test-id': props['data-test-id'] || 'tab-container',
}))``

const HideChatButton = styled.button`
  align-items: center;
  /* TODO: add a global style for this */
  background-color: ${th('colorFurniture')};
  border-radius: ${th('borderRadius')};
  color: ${th('colorText')};
  display: flex;
  float: right;
  font-size: 16px;
  padding: 6px 12px;

  &:hover {
    background-color: ${lightenBy('colorFurniture', 0.2)};
  }
`

const HiddenTabs = ({
  sections,
  onChange,
  defaultActiveKey = null,
  tabsContainerGridArea,
  background,
  hideChat,
}) => {
  const [activeKey, setActiveKey] = useState(defaultActiveKey)

  useEffect(() => {
    setActiveKey(defaultActiveKey)
  }, [defaultActiveKey])

  const setActiveKeyAndCallOnChange = incomingActiveKey => {
    setActiveKey(incomingActiveKey)

    if (typeof onChange === 'function') {
      onChange(incomingActiveKey)
    }
  }

  // const currentContent = (
  //   sections.find(section => section.key === activeKey) || {}
  // ).content

  return (
    <>
      <HiddenTabsContainer
        background={background}
        gridArea={tabsContainerGridArea}
        sticky={false}
      >
        <div style={{ display: 'flex' }}>
          {sections.map(({ key, label }) => (
            <TabContainer
              key={key}
              onClick={() => setActiveKeyAndCallOnChange(key)}
            >
              <Tab active={activeKey === key}>{label || key}</Tab>
            </TabContainer>
          ))}
        </div>

        {hideChat && (
          <HideChatButton onClick={hideChat}>Hide Chat</HideChatButton>
        )}
      </HiddenTabsContainer>

      {sections.map(section => (
        <div
          key={section.key}
          style={{
            display: section.key === activeKey ? 'flex' : 'none',
            height: '100%',
            flexDirection: 'column',
          }}
        >
          {section.content}
        </div>
      ))}
    </>
  )
}

/* eslint-disable import/prefer-default-export */
export { HiddenTabs }
