import React, { useContext, useState, useEffect } from 'react'
import styled from 'styled-components'
import { th, override } from '@pubsweet/ui-toolkit'
import { useTranslation } from 'react-i18next'
import { TabsContainer } from './Tabs'
import { ConfigContext } from '../config/src'
import { color } from '../../theme'

export const Tab = styled.div`
  background: ${({ active }) =>
    active
      ? color.backgroundA
      : 'linear-gradient(180deg, #ECECEC 0%, #ECECEC 40.1%, #D6D6D6 100%)'};
  border-radius: ${th('borderRadius')} ${th('borderRadius')} 0 0;
  box-shadow: ${({ active }) =>
    active
      ? '-4px 0 7px -4px rgba(0, 0, 0, 0.1), 4px 0 7px -4px rgba(0, 0, 0, 0.1), 0 -4px 7px -4px rgba(0, 0, 0, 0.1)'
      : 'none'};
  color: ${color.text};
  cursor: pointer;
  font-size: ${th('fontSizeBaseSmall')};
  font-weight: 500;
  margin-right: ${props => props.theme.spacing.e};
  padding: calc(${th('gridUnit')} - 1px) 1em;
  padding-bottom: 0;
  position: relative;

  div {
    border-bottom: 3px solid
      ${({ active }) => (active ? color.brand1.base : 'none')};
    margin-bottom: -2px;
    padding-bottom: 4px;
  }

  /* stylelint-disable-next-line order/properties-alphabetical-order */
  ${override('ui.Tab')}
`

export const HiddenTabsContainer = styled(TabsContainer)`
  ${props => props.sticky && `background-color: ${color.backgroundC};`}
  ${props => props.sticky && 'position: sticky;'}
  ${props => props.sticky && 'top: -16px;'}
  ${props => props.sticky && 'z-index: 999;'}

  & ~ div .waxmenu {
    ${props => props.sticky && 'top: 23px;'};
  }
`

export const TabContainer = styled.div.attrs(props => ({
  'data-test-id': props['data-test-id'] || 'tab-container',
}))`
  align-items: stretch;
  display: flex;
`

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

const HiddenTabs = ({
  sections,
  onChange,
  defaultActiveKey = null,
  tabsContainerGridArea,
  background,
  hideChat,
}) => {
  const config = useContext(ConfigContext)
  const [activeKey, setActiveKey] = useState(defaultActiveKey)

  const { t } = useTranslation()

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
        config={config}
        gridArea={tabsContainerGridArea}
        sticky={false}
      >
        <div style={{ display: 'flex', alignItems: 'stretch' }}>
          {sections.map(({ key, label }) => (
            <TabContainer
              key={key}
              onClick={() => setActiveKeyAndCallOnChange(key)}
            >
              <Tab active={activeKey === key}>
                <div>{label || key}</div>
              </Tab>
            </TabContainer>
          ))}
        </div>

        {/* TODO: Hide Chat could be a seperate component */}
        {hideChat && (
          <HideChatButton onClick={hideChat}>
            {t('chat.Hide Chat')}
          </HideChatButton>
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
