import React from 'react'
import Checkbox from '../atoms/Checkbox'

class CheckboxGroup extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      values: props.value || []
    }
  }

  handleChange = event => {
    const { values } = this.state

    const value = event.target.value

    if (event.target.checked) {
      values.push(value)
    } else {
      values.splice(values.indexOf(value), 1)
    }

    this.setState({ values })

    this.props.onChange(values)
  }

  render () {
    const { inline, name, options, required } = this.props
    const { values } = this.state

    return (
      <div>
        {options.map(option => (
          <Checkbox
            key={option.value}
            name={name}
            required={required}
            inline={inline}
            value={option.value}
            label={option.label}
            checked={values.includes(option.value)}
            onChange={this.handleChange}/>
        ))}
      </div>
    )
  }
}

export default CheckboxGroup
