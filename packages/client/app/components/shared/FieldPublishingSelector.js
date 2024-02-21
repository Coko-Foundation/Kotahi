import React, { useState } from 'react'

const FieldPublishingSelector = ({ value, onChange }) => {
  const [checked, setChecked] = useState(value) // useState se we can update the checkbox immediately rather than wait for mutation result
  return (
    // eslint-disable-next-line jsx-a11y/label-has-associated-control
    <label>
      Publish{' '}
      <input
        checked={checked}
        onChange={event => {
          onChange(event.target.checked)
          setChecked(event.target.checked)
        }}
        type="checkbox"
      />
    </label>
  )
}

export default FieldPublishingSelector
