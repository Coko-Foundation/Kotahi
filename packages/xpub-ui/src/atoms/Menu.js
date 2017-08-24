import React from 'react'
import classnames from 'classnames'
import classes from './Menu.local.css'

class Menu extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      open: false,
      selected: props.value
    }
  }

  toggleMenu = () => {
    this.setState({
      open: !this.state.open
    })
  }

  handleSelect = selected => {
    this.setState({
      selected,
      open: false
    })

    // TODO: fire "change" event
  }

  optionLabel = value => {
    const { options } = this.props

    return options.find(option => option.value === value).label
  }

  render () {
    const { options, placeholder = 'Choose in the list' } = this.props
    const { open, selected } = this.state

    return (
      <div className={classes.root}>
        <div>
          <button
            className={classes.opener}
            onClick={this.toggleMenu}>
            {selected ? (
              <span>{this.optionLabel(selected)}</span>
            ) : (
              <span className={classes.placeholder}>{placeholder}</span>
            )}
            <span className={classes.arrow}>{ open ? '▲' : '▼' }</span>
          </button>
        </div>

        <div className={classes.menuContainer}>
          {open && (
            <div className={classes.menu}>
              {options.map(option => (
                <div
                  key={option.value}
                  className={classnames(classes.option, {
                    [classes.active]: option.value === selected
                  })}
                  onClick={() => this.handleSelect(option.value)}
                >{option.label || option.value}</div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }
}

export default Menu
