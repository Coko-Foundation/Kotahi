import React from 'react'
import styled from 'styled-components'
import { th } from '@pubsweet/ui-toolkit'

const Button = styled.button.attrs(() => ({
  type: 'button',
}))`
  background: transparent;
  border: ${th('borderWidth')} dashed ${th('colorBorder')};
  height: calc(${th('gridUnit')} * 3);
  cursor: pointer;
  margin-bottom: calc(${th('gridUnit')} * 3);
  padding: ${th('gridUnit')};
`

const UploadButton = ({ name, buttonText, onChange }) => {
  let fileInput
  return (
    <React.Fragment>
      <Button onClick={() => fileInput.click()}>{buttonText}</Button>
      <input
        multiple
        name={name}
        onChange={onChange}
        ref={input => (fileInput = input)}
        style={{ display: 'none' }}
        type="file"
      />
    </React.Fragment>
  )
}

export default UploadButton
