import React from 'react'
import styled from 'styled-components'

const TextInputField = styled.input`
  background: #F8F8F9;
  border: 1px solid #DEDEDE;
  box-shadow: inset 0px 0px 4px rgba(0, 0, 0, 0.07);
  border-radius: 5px;
  height: 45px;
  padding: 13px 10px;
  width: 100%;
  font-size: 16px;
  line-height: 20px;
  letter-spacing: 0.01em;
  color: #323232;

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
