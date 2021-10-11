import React from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'
import { TextField, Button } from '@pubsweet/ui'
import { th } from '@pubsweet/ui-toolkit'
import { v4 as uuid } from 'uuid'
import { DeleteControl } from '../../../shared'
import {
  fields,
  validateAuthors,
} from '../../../../shared/authorsFieldDefinitions'

const Author = styled.div`
  align-items: top;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 10px;
  position: relative;

  & + & {
    margin-top: 10px;
  }
`

const InvalidLabel = styled.div`
  color: ${th('colorError')};
  font-size: 80%;
  position: absolute;
  transform: translate(0, -28px);
`

// TODO This is not following Formik idioms. Improve?
const AuthorsInput = ({ onChange, value }) => {
  const cleanedVal = Array.isArray(value) ? value : [] // We're getting momentary mismatches between field and value, so this can momentarily receive e.g. a string from another field, before a rerender corrects it. Not sure why yet.
  if (value && !Array.isArray(value))
    console.error('Illegal AuthorsInput value:', value)
  return (
    <>
      {cleanedVal.map((author, index) => (
        <Author key={author.id}>
          {fields.map(f => {
            const invalidity = f.validate && f.validate(author[f.name])

            return (
              <div key={f.name}>
                <TextField
                  label={f.label}
                  onChange={v => {
                    const newVal = [...cleanedVal]
                    newVal[index][f.name] = v.target.value
                    onChange(newVal)
                  }}
                  placeholder={f.placeholder}
                  value={author[f.name]}
                />
                {invalidity && <InvalidLabel>{invalidity}</InvalidLabel>}
              </div>
            )
          })}
          <DeleteControl
            onClick={() => {
              onChange(cleanedVal.filter((_, i) => i !== index))
            }}
            tooltip="Delete this author"
          />
        </Author>
      ))}
      <Button
        disabled={validateAuthors(cleanedVal)}
        onClick={() => {
          const newVal = [
            ...cleanedVal,
            {
              firstName: '',
              lastName: '',
              email: '',
              affiliation: '',
              id: uuid(),
            },
          ]

          onChange(newVal)
        }}
        plain
        type="button"
      >
        Add another author
      </Button>
    </>
  )
}

AuthorsInput.propTypes = {
  onChange: PropTypes.func.isRequired,
  value: PropTypes.arrayOf(
    PropTypes.shape({
      firstName: PropTypes.string.isRequired,
      lastName: PropTypes.string.isRequired,
      email: PropTypes.string.isRequired,
      affiliation: PropTypes.string.isRequired,
    }).isRequired,
  ),
}

AuthorsInput.defaultProps = {
  value: null,
}

export default AuthorsInput
