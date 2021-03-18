import React from 'react'
import styled from 'styled-components'
import { FieldArray } from 'formik'
import { TextField, ValidatedFieldFormik, Button } from '@pubsweet/ui'

const Inline = styled.div`
  display: inline-block;
  margin-right: 10px;
`

const UnbulletedList = styled.div`
  list-style-type: none;
`

const Spacing = styled.div`
  padding: 15px 0px;
`

const Option = styled.div`
  padding-bottom: 10px;
`

const keyInput = input => (
  <TextField label="Key Option" placeholder="Enter key…" {...input} />
)

const valueInput = input => (
  <TextField label="Value Option" placeholder="Enter value…" {...input} />
)

const renderOptions = ({ form: { values }, push, remove }) => {
  const hasNewOption = values.options.some(
    opt => opt === undefined || !opt.label || !opt.value,
  )

  return (
    <ul>
      <UnbulletedList>
        {(values.options || []).map((option, index) => (
          // index as key is better than using label or value, which would cause rerender and lose focus during editing.
          // TODO: store an internal ID for each option, and use that as key; OR provide a way of editing an option that doesn't update the option list until the user clicks away (or a modal editor)
          // eslint-disable-next-line react/no-array-index-key
          <li key={index}>
            <Spacing>
              <Option>
                Option:&nbsp;
                {values.options.length > 1 && (
                  <Button onClick={() => remove(index)} type="button">
                    Remove
                  </Button>
                )}
              </Option>
              <div>
                <Inline>
                  <ValidatedFieldFormik
                    component={keyInput}
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
              </div>
            </Spacing>
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
    </ul>
  )
}

const OptionsField = () => (
  <FieldArray component={renderOptions} name="options" />
)

export default OptionsField
