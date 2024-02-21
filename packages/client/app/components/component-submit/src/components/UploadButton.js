import React from 'react'
import styled from 'styled-components'
import { th } from '@pubsweet/ui-toolkit'

const Button = styled.button.attrs(() => ({
  type: 'button',
}))`
  background: transparent;
  border: ${th('borderWidth')} dashed ${th('colorBorder')};
  cursor: pointer;
  height: calc(${th('gridUnit')} * 3);
  margin-bottom: calc(${th('gridUnit')} * 3);
  padding: ${th('gridUnit')};
`

const UploadButton = ({ name, buttonText, onChange }) => {
  let fileInput
  return (
    <>
      <Button onClick={() => fileInput.click()}>{buttonText}</Button>
      <input
        multiple
        name={name}
        onChange={onChange}
        ref={input => (fileInput = input)}
        style={{ display: 'none' }}
        type="file"
      />
    </>
  )
}

export default UploadButton
