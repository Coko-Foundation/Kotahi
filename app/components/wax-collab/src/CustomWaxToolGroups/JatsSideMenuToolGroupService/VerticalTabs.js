import React, { useState, useContext } from 'react'
import { th } from '@pubsweet/ui-toolkit'
import { WaxContext } from 'wax-prosemirror-core'
import PropTypes from 'prop-types'
import styled, { css } from 'styled-components'
import Icon from './Icon'

// n.b. Henrik's current design is at https://www.figma.com/file/uDxsjgDWxjiof0qSNFLelr/Kotahi-storybook?node-id=6256%3A11486

const useCircles = true // turn this on if you want colors next to annotations

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

const ElementGroup = styled.details`
  & summary {
    font-size: 14px;
    font-weight: bold;
    user-select: none;
    cursor: pointer;
    margin: 0;
    color: ${th('colorPrimary')};
    &::marker {
      color: ${th('colorBackgroundTabs')};*/
    }
  }
  & + details {
    margin-top: 4px;
  }
`

const BlockElementWrapper = styled.div`
  display: flex;
  & button {
    transition: 0.25s;
    border-radius: 4px;
    margin-left: 4px;
    position: relative;
    padding: 0;
    display: inline-flex;
    align-items: center;
    background-color: ${props =>
      props.isActive ? th('colorBackgroundTabs') : 'transparent'};
    &:after {
      position: relative;
      margin-left: -4px;
      content: '';
      width: ${props => (props.color ? '14px' : 0)};
      margin-right: ${props => (props.color ? '8px' : 0)};
      height: 14px;
      border-radius: 100%;
      border: 1px solid ${props => props.color || 'transparent'};
      top: 1px;
    }
    & span {
      font-size: 14px;
      color: ${th('colorPrimary')};
    }
    &:hover {
      & span {
        color: ${props =>
          props.isActive ? th('colorTextReverse') : th('colorPrimary')};
      }
    }
  }
`

const BlockElement = ({ item, onClick, view, showCitations }) => {
  const { active, select } = item
  const context = useContext(WaxContext)

  const { activeViewId, activeView } = context

  const { state } = view

  const isActive = !!(
    active(activeView.state, activeViewId) &&
    select(state, activeViewId, activeView)
  )

  return (
    <BlockElementWrapper
      color={(useCircles && showCitations && item.color) || null}
      isActive={isActive}
      onClick={onClick}
      onMouseOver={() => {
        // If we are hovering over a citation title and citations are not shown, highlight them.
        // TODO: don't do this if we don't have to.
        // if (
        //   document
        //     .querySelector('.editorArea')
        //     .classList.contains('hide-citation-spans')
        // ) {
        //   console.log(item.name, item)
        // }
      }}
    >
      {item.renderTool(view)}
    </BlockElementWrapper>
  )
}

const BlockElementGroup = ({ groupName, items, view }) => {
  const [showCitations, setShowCitations] = useState(false)

  // maybe this should be generalized if we're going to use something similar elsewhere?
  React.useEffect(() => {
    if (groupName === 'Citations') {
      if (showCitations) {
        // NOTE: this is ugly, though necessary to get footnotes–-".panelGroup" is the closest parent that covers both
        document
          .querySelector('.editorArea')
          .classList.remove('hide-citation-spans')
      } else {
        document
          .querySelector('.editorArea')
          .classList.add('hide-citation-spans')
      }
    }
  }, [showCitations])

  return (
    <ElementGroup open>
      <summary>
        {groupName}
        {groupName === 'Citations' ? (
          <a
            href="/#"
            onClick={e => {
              e.preventDefault()
              setShowCitations(!showCitations)
            }}
            style={{ marginLeft: 20, color: 'gray', fontWeight: 'normal' }}
          >
            {showCitations ? 'Hide' : 'Show'}
          </a>
        ) : (
          ''
        )}
      </summary>
      <div>
        {items &&
          items.map(item => (
            <BlockElement
              item={item}
              key={item.name}
              showCitations={showCitations}
              view={view}
            />
          ))}
      </div>
    </ElementGroup>
  )
}

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
