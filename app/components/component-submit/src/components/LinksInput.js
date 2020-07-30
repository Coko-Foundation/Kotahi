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
`

const Spacing = styled.div`
  padding: 15px 0px;
`

const Author = styled.div`
  padding-bottom: 10px;
`

const URLInput = input => (
  <TextField label="URL" placeholder="Enter a URL" {...input} />
)

const onChangeFn = (onChange, setFieldValue, values) => value => {
  const val = value.target ? value.target.value : value
  setFieldValue(value.target.name, val, true)

  const data = cloneDeep(values)
  set(data, value.target.name, val)
  onChange(data.authors, 'authors')
}

const renderLinks = onChange => ({
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
          Add another link
        </Button>
      </li>
      {(values.authors || []).map((author, index) => (
        <li key={`author-${author}`}>
          <Spacing>
            <Author>
              Link:&nbsp;
              {values.authors.length > 1 && (
                <Button onClick={() => remove(index)} type="button">
                  Remove
                </Button>
              )}
            </Author>
            <div>
              <Inline>
                <ValidatedFieldFormik
                  component={URLInput}
                  name={`authors.${index}.firstName`}
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
  <FieldArray name="authors" render={renderLinks(onChange)} />
)

export default AuthorsInput
