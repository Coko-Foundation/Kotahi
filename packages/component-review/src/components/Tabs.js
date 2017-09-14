import React from 'react'
import { compose, withState } from 'recompose'
import Tab from './Tab'
import classes from './Tabs.local.scss'

const Tabs = ({ sections, title, activeKey, setActiveKey }) => (
  <div className={classes.root}>
    <div className={classes.tabs}>
      {title && (
        <span className={classes.title}>
          {title}
        </span>
      )}

      {sections.map(({ key }) => (
        <span
          key={key}
          className={classes.tab}
          onClick={() => setActiveKey(key)}>
          <Tab active={activeKey === key}>
            {key}
          </Tab>
        </span>
      ))}
    </div>

    <div>
      {sections.find(section => section.key === activeKey).content}
    </div>
  </div>
)

export default compose(
  withState('activeKey', 'setActiveKey', props => props.activeKey)
)(Tabs)
