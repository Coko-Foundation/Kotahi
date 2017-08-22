import React from 'react'
import Radio from '../atoms/Radio'

const RadioGroup = ({ name, value, options, required, handleChange }) => (
  <div>
    {options.map(option => (
      <Radio
        key={option.value}
        name={name}
        required={required}
        value={option.value}
        label={option.label}
        checked={option.value === value}
        handleChange={handleChange}/>
    ))}
  </div>
)

export default RadioGroup
