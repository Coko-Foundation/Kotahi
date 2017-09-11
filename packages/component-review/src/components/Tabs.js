import React from 'react'
import classnames from 'classnames'
import { compose, withState } from 'recompose'
import classes from './Tabs.local.scss'

const Tabs = ({ sections, active, setActive }) => (
  <div>
    <div className={classes.tabs}>
      {Object.keys(sections).map(key => (
        <div
          key={key}
          className={classnames(classes.tab, {
            [classes.active]: active === key
          })}
          onClick={() => setActive(key)}>
          {key}
        </div>
      ))}
    </div>

    <div className={classes.panes}>
      {Object.keys(sections).map(key => (
        <div
          key={key}
          className={classnames(classes.pane, {
            [classes.active]: active === key
          })}>
          {sections[key]}
        </div>
      ))}
    </div>
  </div>
)

export default compose(
  withState('active', 'setActive', props => props.active)
)(Tabs)
