import React from 'react'
import styled, { css } from 'styled-components'
import { th, override } from '@pubsweet/ui-toolkit'

const Label = styled.span`
  ${props =>
    props.disabled &&
    css`
      cursor: not-allowed;
    `};

  ${override('ui.Label')};
  ${override('ui.Radio.Label')};
`

const Input = styled.input`
  margin-right: ${th('gridUnit')};
  ${override('ui.Radio.Input')};
`

const Root = styled.label`
  align-items: center;
  color: ${props => (props.color ? props.color : props.theme.colorText)};
  cursor: pointer;
  display: ${props => (props.inline ? 'inline-flex' : 'flex')};
  min-height: calc(${th('gridUnit')} * 3);

  ${override('ui.Radio')};
`

// eslint-disable-next-line import/prefer-default-export
export const Radio = ({
  className,
  disabled,
  color,
  inline,
  name,
  value,
  label,
  checked,
  required,
  onChange,
}) => (
  <Root checked={checked} className={className} color={color} inline={inline}>
    <Input
      checked={checked}
      disabled={disabled}
      name={name}
      onChange={onChange}
      required={required}
      type="radio"
      value={value}
    />
    <Label checked={checked} color={color} disabled={disabled}>
      {label}
    </Label>
  </Root>
)
