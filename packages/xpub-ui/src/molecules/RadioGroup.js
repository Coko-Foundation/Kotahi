import React from 'react'
import Radio from '../atoms/Radio'

class RadioGroup extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      value: props.value
    }
  }

  handleChange = event => {
    this.setState({
      value: event.target.value
    })

    this.props.onChange(event)
  }

  render () {
    const { name, options, required } = this.props
    const { value } = this.state

    return (
      <div>
        {options.map(option => (
          <Radio
            key={option.value}
            name={name}
            required={required}
            value={option.value}
            label={option.label}
            checked={option.value === value}
            onChange={this.handleChange}/>
        ))}
      </div>
    )
  }
}

export default RadioGroup
