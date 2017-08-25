import React from 'react'
import RadioGroup from './RadioGroup'
import classes from './YesOrNo.local.css'

const options = [
  {
    value: 'yes',
    label: 'Yes'
  },
  {
    value: 'no',
    label: 'No'
  }
]

const YesOrNo = ({ name, value, required, onChange }) => (
  <RadioGroup
    className={classes.root}
    name={name}
    options={options}
    value={value}
    required={required}
    inline={true}
    onChange={onChange}/>
)

export default YesOrNo
