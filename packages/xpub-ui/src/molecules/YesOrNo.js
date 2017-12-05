import React from 'react'
import RadioGroup from './RadioGroup'
import classes from './YesOrNo.local.scss'

const options = [
  {
    label: 'Yes',
    value: 'yes',
  },
  {
    label: 'No',
    value: 'no',
  },
]

const YesOrNo = ({ name, value, required, onChange, readonly }) => (
  <RadioGroup
    className={classes.root}
    inline
    name={name}
    onChange={onChange}
    options={options}
    readonly={readonly}
    required={required}
    value={value}
  />
)

export default YesOrNo
