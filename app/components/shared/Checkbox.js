import React from 'react'
import styled from 'styled-components'
import theme from '../../theme'

const CheckboxContainer = styled.div`
  align-content: center;
  display: flex;
  margin-bottom: 4px;

  input[type='checkbox'] {
    accent-color: ${theme.colors.brand1.shade25};
    background: #f8f8f9;
    border: 1px solid ${theme.colors.neutral.gray80};
    border-radius: 5px;
    color: white;
    padding: 14px 9px;

    &:active,
    &:focus-visible {
      /* border: 1px solid ${theme.colors.neutral.gray70}; */
      outline: none;
    }

    &:hover {
      accent-color: ${theme.colors.brand1.shade25};
      border: none;
    }
  }

  label {
    margin-left: ${theme.spacing.e};
  }
`

// eslint-disable-next-line import/prefer-default-export
export const Checkbox = props => {
  const { checked, id, label, value, handleChange } = props

  return (
    <CheckboxContainer>
      <input
        checked={checked}
        id={id}
        name={value}
        onChange={handleChange}
        type="checkbox"
      />
      <label htmlFor={id}>{label}</label>
    </CheckboxContainer>
  )
}
