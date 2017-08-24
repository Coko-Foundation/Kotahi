import React from 'react'
import Radio from '../atoms/Radio'

const RadioGroup = ({ name, value, options, required }) => (
  <div>
    {options.map(option => (
      <Radio
        key={option.value}
        name={name}
        required={required}
        value={option.value}
        label={option.label}
        checked={option.value === value}/>
    ))}
  </div>
)

export default RadioGroup
