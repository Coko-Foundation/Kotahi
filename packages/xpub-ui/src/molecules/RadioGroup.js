import React from 'react'
import Radio from '../atoms/Radio'

class RadioGroup extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      value: props.value,
    }
  }

  handleChange = event => {
    const value = event.target.value

    this.setState({ value })

    this.props.onChange(value)
  }

  render() {
    const { inline, name, options, required } = this.props
    const { value } = this.state

    return (
      <div>
        {options.map(option => (
          <Radio
            key={option.value}
            name={name}
            required={required}
            inline={inline}
            value={option.value}
            label={option.label}
            color={option.color}
            checked={option.value === value}
            onChange={this.handleChange}
          />
        ))}
      </div>
    )
  }
}

export default RadioGroup
