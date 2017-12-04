import React from 'react'
import classnames from 'classnames'
import classes from './Menu.local.scss'

// TODO: match the width of the container to the width of the widest option?
// TODO: use a <select> element instead of divs?

class Menu extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      open: false,
      selected: props.value,
    }
  }

  toggleMenu = () => {
    this.setState({
      open: !this.state.open,
    })
  }

  handleSelect = selected => {
    this.setState({
      selected,
      open: false,
    })

    this.props.onChange(selected)
  }

  optionLabel = value => {
    const { options } = this.props

    return options.find(option => option.value === value).label
  }

  render() {
    const { label, options, placeholder = 'Choose in the list' } = this.props
    const { open, selected } = this.state

    return (
      <div
        className={classnames(classes.root, {
          [classes.open]: open,
        })}
      >
        {label && <span className={classes.label}>{label}</span>}

        <div className={classes.main}>
          <div className={classes.openerContainer}>
            <button
              type="button"
              className={classes.opener}
              onClick={this.toggleMenu}
            >
              {selected ? (
                <span>{this.optionLabel(selected)}</span>
              ) : (
                <span className={classes.placeholder}>{placeholder}</span>
              )}
              <span className={classes.arrow}>▼</span>
            </button>
          </div>

          <div className={classes.optionsContainer}>
            {open && (
              <div className={classes.options}>
                {options.map(option => (
                  <div
                    key={option.value}
                    className={classnames(classes.option, {
                      [classes.active]: option.value === selected,
                    })}
                    onClick={() => this.handleSelect(option.value)}
                  >
                    {option.label || option.value}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }
}

export default Menu
