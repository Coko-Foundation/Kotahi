import React, { useState } from 'react'
import { th } from '@pubsweet/ui-toolkit'
import PropTypes from 'prop-types'
import styled, { css } from 'styled-components'
import Icon from './Icon'

// n.b. Henrik's current design is at https://www.figma.com/file/uDxsjgDWxjiof0qSNFLelr/Kotahi-storybook?node-id=6256%3A11486

const TabWrapper = styled.div`
  display: flex;
  height: 100%;
  flex-direction: column;
`

const Tabs = styled.div`
  background: #fff;
  display: flex;
  flex-direction: row;
  & > div:first-child {
    margin-top: 0;
  }
`

const activeTab = css`
  background: ${th('colorBackgroundTabs')};
  box-shadow: 0 0 1px ${th('colorPrimary')};
`

const disabledTab = css`
  display: none;
  cursor: not-allowed;
  opacity: 0.4;
`

const Tab = styled.div`
  cursor: pointer;
  margin: 0 4px 4px 4px;
  ${props => props.active && activeTab}
  ${props => props.disabled && disabledTab}

  padding: 8px;

  &:first-child {
    margin-top: 4px;
  }

  &:hover {
    background: ${th('colorBackgroundTabs')};
  }
`

const Content = styled.div`
  background: #fff;
  height: 100%;
  width: 100%;
`

export const VerticalTabs = ({ tabList }) => {
  if (!tabList || tabList.length === 0) return null

  const [tabDisplay, setTabDisplay] = useState(tabList[0].id)

  return (
    <TabWrapper>
      <Tabs>
        {tabList.map(tab => (
          <Tab
            active={tabDisplay === tab.id}
            disabled={tab.disabled}
            key={tab.id}
            onClick={() => {
              if (!tab.disabled) setTabDisplay(tab.id)
            }}
            title={tab.title}
          >
            <Icon name={tab.icon} />
          </Tab>
        ))}
      </Tabs>

      <Content>{tabList.find(tab => tabDisplay === tab.id).component}</Content>
    </TabWrapper>
  )
}

const BlockLevelToolsWrapper = styled.div`
  height: 100%;
  overflow-y: auto;
  padding: 8px 8px 16px 8px;
  > div:not(:last-child) {
    margin-bottom: 10px;
  }
`

const GroupName = styled.div`
  font-size: 14px;
  margin-bottom: 4px;
  text-transform: uppercase;
`

const ListWrapper = styled.div`
  > div:not(:last-child) {
    margin-bottom: 4px;
  }
`

const BlockElementWrapper = styled.div`
  display: flex;

  button {
    border-radius: 4px;
    left: -33px;
    margin-left: 4px;
    padding-left: 25px;
    position: relative;
  }
`

const BlockElement = ({ item, onClick, view }) => (
  <BlockElementWrapper onClick={onClick}>
    {item.renderTool(view)}
  </BlockElementWrapper>
)

const BlockElementGroup = ({ groupName, items, view }) => (
  <>
    <GroupName>{groupName}</GroupName>
    <ListWrapper>
      {items &&
        items.map(item => (
          <BlockElement item={item} key={item.name} view={view} />
        ))}
    </ListWrapper>
  </>
)

export const BlockLevelTools = ({ groups, view }) => (
  <BlockLevelToolsWrapper>
    {groups &&
      groups.map(group => (
        <BlockElementGroup
          groupName={group.groupName}
          items={group.items}
          key={group.groupName}
          view={view}
        />
      ))}
  </BlockLevelToolsWrapper>
)

BlockLevelTools.propTypes = {
  groups: PropTypes.arrayOf(
    PropTypes.shape({
      groupName: PropTypes.string,
      items: PropTypes.arrayOf(
        PropTypes.shape({
          label: PropTypes.string,
        }),
      ),
    }),
  ).isRequired,
}

VerticalTabs.propTypes = {
  tabList: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      displayName: PropTypes.string,
      component: PropTypes.node,
    }),
  ).isRequired,
}
