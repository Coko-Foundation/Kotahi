import React from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'
import { Button } from '@pubsweet/ui'
import { th } from '@pubsweet/ui-toolkit'
import { v4 as uuid } from 'uuid'
import { useTranslation } from 'react-i18next'
import { DeleteControl, TextInput } from '../../../shared'
import {
  fields,
  validateAuthors,
} from '../../../../shared/authorsFieldDefinitions'
import theme from '../../../../theme'

const Author = styled.div`
  align-items: top;
  display: grid;
  grid-gap: 36px;
  grid-template-columns: 1fr 1fr;
  margin-bottom: ${theme.spacing.f};
  margin-top: ${theme.spacing.e};
  position: relative;
  width: 600px;

  @media only screen and (max-width: 700px) {
    width: 400px;
  }

  & + & {
    margin-top: 10px;
  }
`

const AuthorContainer = styled.div`
  display: flex;
`

const InvalidLabel = styled.div`
  color: ${th('colorError')};
  font-size: 80%;
`

const StyledDeleteControl = styled(DeleteControl)`
  margin: 32px 10px 0 1em;
  top: 66px;
`

const localizeFields = (origFields, t) => {
  let clonedFieds = JSON.parse(JSON.stringify(origFields))

  clonedFieds = clonedFieds.map((field, index) => {
    const newField = { ...field }
    newField.label = t(`authorsInput.${field.name}.label`)
    newField.placeholder = t(`authorsInput.${field.name}.placeholder`)
    return newField
  })

  return clonedFieds
}

// TODO This is not following Formik idioms. Improve?
const AuthorsInput = ({ onChange, value, overrideButtonLabel = undefined }) => {
  const { t } = useTranslation()
  const cleanedVal = Array.isArray(value) ? value : [] // We're getting momentary mismatches between field and value, so this can momentarily receive e.g. a string from another field, before a rerender corrects it. Not sure why yet.
  const localizedFields = localizeFields(fields, t)

  if (value && !Array.isArray(value))
    console.error('Illegal AuthorsInput value:', value)
  return (
    <div>
      {cleanedVal.map((author, index) => (
        <AuthorContainer key={author.id}>
          <Author>
            {localizedFields.map(f => {
              const invalidity = f.validate && f.validate(author[f.name])

              return (
                <div key={f.name}>
                  <TextInput
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
          </Author>
          <StyledDeleteControl
            onClick={() => {
              onChange(cleanedVal.filter((_, i) => i !== index))
            }}
            tooltip={t('decisionPage.Delete this author')}
          />
        </AuthorContainer>
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
        {!overrideButtonLabel
          ? t('decisionPage.Add another person')
          : overrideButtonLabel}
      </Button>
    </div>
  )
}

AuthorsInput.propTypes = {
  onChange: PropTypes.func.isRequired,
  /** value should be an array of objects or null, but we also currently permit empty string */
  value: PropTypes.oneOfType([
    PropTypes.arrayOf(
      PropTypes.shape({
        firstName: PropTypes.string.isRequired,
        lastName: PropTypes.string.isRequired,
        email: PropTypes.string.isRequired,
        affiliation: PropTypes.string.isRequired,
      }).isRequired,
    ),
    PropTypes.oneOf(['']),
  ]),
}

AuthorsInput.defaultProps = {
  value: null,
}

export default AuthorsInput
