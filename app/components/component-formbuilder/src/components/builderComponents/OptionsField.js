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

const renderOptions = ({ form: { values }, push, remove }) => (
  <ul>
    <UnbulletedList>
      <li>
        <Button onClick={() => push()} plain type="button">
          Add another option
        </Button>
      </li>
      {(values.options || []).map((option, index) => (
        <li key={option.value}>
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
    </UnbulletedList>
  </ul>
)

const OptionsField = () => (
  <FieldArray component={renderOptions} name="options" />
)

export default OptionsField
