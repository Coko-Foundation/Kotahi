import React from 'react'
import styled from 'styled-components'
import { FieldArray } from 'formik'
import { TextField, ValidatedFieldFormik, Button } from '@pubsweet/ui'
import { DeleteControl } from '../../../../shared'

const Inline = styled.div`
  display: inline-block;
  margin-right: 10px;
  position: relative;
  vertical-align: top;
`

const UnbulletedList = styled.ul`
  list-style-type: none;
`

const labelInput = input => (
  <TextField label="Label to display" placeholder="Enter label…" {...input} />
)

const valueInput = input => (
  <TextField label="Internal name" placeholder="Enter name…" {...input} />
)

const renderOptions = ({ form: { values }, push, remove }) => {
  const hasNewOption = values.options.some(
    opt => opt === undefined || !opt.label || !opt.value,
  )

  return (
    <UnbulletedList>
      {(values.options || []).map((option, index) => (
        // a newly-added option doesn't have an id yet, so we fall back on index
        <li key={option?.id ?? index}>
          <div>
            <Inline>
              <ValidatedFieldFormik
                component={labelInput}
                name={`options.${index}.label`}
                required
              />
            </Inline>
            <Inline>
              <ValidatedFieldFormik
                component={valueInput}
                name={`options.${index}.value`}
                required
              />
            </Inline>
            <DeleteControl
              onClick={() => remove(index)}
              tooltip="Delete this option"
            />
          </div>
        </li>
      ))}
      <li>
        <Button
          disabled={hasNewOption}
          onClick={() => push()}
          plain
          type="button"
        >
          Add another option
        </Button>
      </li>
    </UnbulletedList>
  )
}

const OptionsField = () => (
  <FieldArray component={renderOptions} name="options" />
)

export default OptionsField
