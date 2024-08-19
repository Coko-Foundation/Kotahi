import React from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'
import { v4 as uuid } from 'uuid'
import { useTranslation } from 'react-i18next'
import { Button } from '../../../pubsweet'
import { DeleteControl, InvalidLabel, TextInput } from '../../../shared'
import {
  getAuthorFields,
  validateAuthors,
} from '../../../../shared/authorsFieldDefinitions'
import theme, { color } from '../../../../theme'

const Author = styled.div`
  align-items: top;
  display: grid;
  grid-gap: 24px;
  grid-template-columns: 1fr 1fr;
  margin: ${theme.spacing.d};
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
  align-items: flex-start;
  border: 1px solid ${color.gray80};
  border-radius: ${theme.borderRadius};
  display: flex;
  justify-content: space-between;
  padding: 4px;
  width: 100%;
`

const Wrapper = styled.div`
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
`

const StyledDeleteControl = styled(DeleteControl)`
  margin: 32px 10px 0 1em;
  top: 66px;
`

const localizeFields = (origFields, t) => {
  let clonedFields = [...origFields]

  clonedFields = clonedFields.map((field, index) => {
    const newField = { ...field }
    newField.label = t(`authorsInput.${field.name}.label`)
    newField.placeholder = t(`authorsInput.${field.name}.placeholder`)
    return newField
  })

  return clonedFields
}

const AuthorsInput = ({
  onChange,
  requireEmail,
  value,
  overrideButtonLabel = undefined,
}) => {
  const { t } = useTranslation()
  const cleanedVal = Array.isArray(value) ? value : [] // We're getting momentary mismatches between field and value, so this can momentarily receive e.g. a string from another field, before a rerender corrects it. Not sure why yet.

  const authorFieldOptions = { requireEmail } // add more definitions here as needed

  const authorFields = getAuthorFields(authorFieldOptions)
  const localizedFields = localizeFields(authorFields, t)

  if (value && !Array.isArray(value))
    console.error('Illegal AuthorsInput value:', value)
  return (
    <Wrapper>
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
        disabled={validateAuthors(cleanedVal, authorFieldOptions)}
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
    </Wrapper>
  )
}

AuthorsInput.propTypes = {
  onChange: PropTypes.func.isRequired,
  requireEmail: PropTypes.bool,
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
  requireEmail: false,
  value: null,
}

export default AuthorsInput
