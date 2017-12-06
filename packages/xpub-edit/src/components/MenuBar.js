import React from 'react'
import map from 'lodash/map'
import classnames from 'classnames'
import classes from './MenuBar.local.css'

const MenuBar = ({ title, menu, state, dispatch }) => {
  const handle = cmd => e => {
    e.preventDefault()
    cmd(state, dispatch)
  }

  const Button = (item, key) => (
    <button
      className={classnames({
        [classes.button]: true,
        [classes.active]: item.active && item.active(state),
      })}
      disabled={item.enable && !item.enable(state)}
      key={key}
      onMouseDown={handle(item.run)}
      title={item.title}
      type="button"
    >
      {item.content}
    </button>
  )

  return (
    <div className={classes.toolbar}>
      {title && <div className={classes.title}>{title}</div>}

      {menu.marks && map(menu.marks, Button)}
      {menu.blocks && map(menu.blocks, Button)}
      {menu.insert && map(menu.insert, Button)}
      {menu.history && map(menu.history, Button)}
      {menu.table && map(menu.table, Button)}
    </div>
  )
}

export default MenuBar
