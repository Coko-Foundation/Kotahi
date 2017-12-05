import React from 'react'
import Checkbox from '../atoms/Checkbox'

class CheckboxGroup extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      values: props.value || [],
    }
  }

  handleChange = event => {
    const { values } = this.state

    const { value } = event.target

    if (event.target.checked) {
      values.push(value)
    } else {
      values.splice(values.indexOf(value), 1)
    }

    this.setState({ values })

    this.props.onChange(values)
  }

  render() {
    const { inline, name, options, required, readonly } = this.props
    const { values } = this.state

    return (
      <div>
        {options.map(option => (
          <Checkbox
            checked={values.includes(option.value)}
            inline={inline}
            key={option.value}
            label={option.label}
            name={name}
            onChange={this.handleChange}
            readonly={readonly}
            required={required}
            value={option.value}
          />
        ))}
      </div>
    )
  }
}

export default CheckboxGroup
