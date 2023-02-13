import React from 'react'
import styled from 'styled-components'
import { grid } from '@pubsweet/ui-toolkit'

const TextInputField = styled.input`
  background: #F8F8F9;
  border: 1px solid #DEDEDE;
  box-shadow: inset 0px 0px 4px rgba(0, 0, 0, 0.25);
  border-radius: 5px;
  min-height: 45px;
  padding: 15px 10px;
  width: 100%;

  &:focus {
    border-color: #5DAB41;
    box-shadow: inset 0px 0px 4px #5DAB41;
  }
`

const TextInput = props => {
  const { placeholder, value, onChange, ...rest } = props
  return <TextInputField
    onChange={onChange}
    placeholder={placeholder}
    value={value}
    {...rest}
  />
}

export default TextInput
