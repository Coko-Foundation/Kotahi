import React, { useState, useEffect } from 'react'
import styled, { css } from 'styled-components'
import { th, override } from '@pubsweet/ui-toolkit'
import lightenBy from '../../shared/lightenBy'

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

export const TabsContainer = styled.div`
  display: flex;

  margin-top: ${() =>
    ['ncrc'].includes(process.env.INSTANCE_NAME) ? '16px' : '0'};

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

/* eslint-disable import/prefer-default-export */
export { Tabs }
