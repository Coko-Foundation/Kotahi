import React from 'react'
import styled from 'styled-components'
import { th, override } from '@coko/client'

const Label = styled.span`
  ${override('ui.Checkbox.Label')};
`

const Input = styled.input`
  margin-right: ${th('gridUnit')};
  ${override('ui.Checkbox.Input')};
`

const Root = styled.label`
  align-items: center;
  cursor: pointer;
  display: ${props => (props.inline ? 'inline-flex' : 'flex')};
  font-family: ${th('fontAuthor')};

  &:not(:last-child) {
    margin-right: ${props => (props.inline ? props.theme.gridUnit : '0')};
  }

  ${override('ui.Checkbox')};
`

const Checkbox = ({
  className,
  disabled,
  inline,
  name,
  value,
  label,
  checked,
  required,
  onChange,
}) => {
  /* eslint-disable-next-line no-param-reassign */
  checked = checked || false

  return (
    <Root checked={checked} className={className} inline={inline}>
      <Input
        checked={checked}
        disabled={disabled}
        name={name}
        onChange={onChange}
        required={required}
        type="checkbox"
        value={value}
      />
      <Label checked={checked}>{label}</Label>
    </Root>
  )
}

export default Checkbox
