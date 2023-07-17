import React, { useContext, useState, useEffect } from 'react'
import styled, { css } from 'styled-components'
import { th, override } from '@pubsweet/ui-toolkit'
import { ConfigContext } from '../config/src'
import { color } from '../../theme'

const Tab = styled.div`
  background-color: ${({ active }) =>
    active ? color.brand1.tint70 : color.gray90};
  border-bottom: 2px solid
    ${({ active }) => (active ? color.brand1.base : color.gray90)};
  border-radius: ${th('borderRadius')} ${th('borderRadius')} 0 0;
  color: ${color.text};
  cursor: pointer;
  font-size: ${th('fontSizeBaseSmall')};
  font-weight: 500;
  padding: calc(${th('gridUnit')} - 1px) 1em;

  /* stylelint-disable-next-line order/properties-alphabetical-order */
  ${override('ui.Tab')}
`

export const TabsContainer = styled.div`
  display: flex;
  justify-content: space-between;

  ${props =>
    props.config &&
    css`
      margin-top: ${() =>
        ['ncrc'].includes(props.config.instanceName) ? '16px' : '0'};
    `}

  ${props =>
    props.background &&
    css`
      background-color: ${th(props.background)};
    `}

  ${props =>
    props.gridArea &&
    css`
      grid-area: ${props.gridArea};
    `};
`

const TabContainer = styled.div.attrs(props => ({
  'data-test-id': props['data-test-id'] || 'tab-container',
}))``

const HideChatButton = styled.button`
  align-items: center;
  /* TODO: add a global style for this */
  background-color: ${color.gray90};
  border-radius: ${th('borderRadius')};
  color: ${color.text};
  display: flex;
  float: right;
  font-size: 16px;
  padding: 6px 12px;

  &:hover {
    background-color: ${color.gray95};
  }
`

const Tabs = ({
  sections,
  onChange,
  defaultActiveKey = null,
  tabsContainerGridArea,
  background,
  hideChat,
}) => {
  const config = useContext(ConfigContext)
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

  const currentContent = (
    sections.find(section => section.key === activeKey) || {}
  ).content

  return (
    <>
      <TabsContainer
        background={background}
        config={config}
        gridArea={tabsContainerGridArea}
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
      </TabsContainer>

      {activeKey && currentContent}
    </>
  )
}

/* eslint-disable import/prefer-default-export */
export { Tabs }
