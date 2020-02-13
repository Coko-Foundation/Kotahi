import React from 'react'
import styled from 'styled-components'
import { FieldArray } from 'formik'
import { cloneDeep, set } from 'lodash'
import { TextField, Button, ValidatedFieldFormik } from '@pubsweet/ui'
import { minSize } from 'xpub-validators'

const minSize1 = minSize(1)

const Inline = styled.div`
  display: inline-block;
  margin-right: 30px;
`

const UnbulletedList = styled.div`
  list-style-type: none;
  margin-left: -40px;
`

const Spacing = styled.div`
  padding: 15px 0px;
`

const Author = styled.div`
  padding-bottom: 10px;
`

const firstNameInput = input => (
  <TextField label="First name" placeholder="Enter first name…" {...input} />
)

const lastNameInput = input => (
  <TextField label="Last name" placeholder="Enter last name…" {...input} />
)

const emailAddressInput = input => (
  <TextField
    label="Email address"
    placeholder="Enter email address…"
    {...input}
  />
)

const affiliationInput = input => (
  <TextField label="Affiliation" placeholder="Enter affiliation…" {...input} />
)

const onChangeFn = (onChange, setFieldValue, values) => value => {
  const val = value.target ? value.target.value : value
  setFieldValue(value.target.name, val, true)

  const data = cloneDeep(values)
  set(data, value.target.name, val)
  onChange(data.authors, 'authors')
}

const renderAuthors = onChange => ({
  form: { values, setFieldValue },
  insert,
  remove,
}) => (
  <ul>
    <UnbulletedList>
      <li>
        <Button
          onClick={() =>
            insert((values.authors || []).length, {
              firstName: '',
              lastName: '',
              email: '',
              affiliation: '',
            })
          }
          plain
          type="button"
        >
          Add another author
        </Button>
      </li>
      {(values.authors || []).map((author, index) => (
        <li key={`author-${author}`}>
          <Spacing>
            <Author>
              Author:&nbsp;
              {values.authors.length > 1 && (
                <Button onClick={() => remove(index)} type="button">
                  Remove
                </Button>
              )}
            </Author>
            <div>
              <Inline>
                <ValidatedFieldFormik
                  component={firstNameInput}
                  name={`authors.${index}.firstName`}
                  onChange={onChangeFn(onChange, setFieldValue, values)}
                  validate={minSize1}
                />
              </Inline>

              <Inline>
                <ValidatedFieldFormik
                  component={lastNameInput}
                  name={`authors.[${index}].lastName`}
                  onChange={onChangeFn(onChange, setFieldValue, values)}
                  validate={minSize1}
                />
              </Inline>
            </div>

            <div>
              <Inline>
                <ValidatedFieldFormik
                  component={emailAddressInput}
                  name={`authors.[${index}].email`}
                  onChange={onChangeFn(onChange, setFieldValue, values)}
                  validate={minSize1}
                />
              </Inline>

              <Inline>
                <ValidatedFieldFormik
                  component={affiliationInput}
                  name={`authors.[${index}].affiliation`}
                  onChange={onChangeFn(onChange, setFieldValue, values)}
                  validate={minSize1}
                />
              </Inline>
            </div>
          </Spacing>
        </li>
      ))}
    </UnbulletedList>
  </ul>
)

const AuthorsInput = ({ onChange }) => (
  <FieldArray name="authors" render={renderAuthors(onChange)} />
)

export default AuthorsInput
