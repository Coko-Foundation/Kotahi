/* eslint-disable react-hooks/immutability */
/* eslint-disable react/prop-types */
/* eslint-disable no-return-assign */

import styled from 'styled-components'
import { grid, th } from '@coko/client'

const Button = styled.button.attrs(() => ({
  type: 'button',
}))`
  background: transparent;
  border: ${th('borderWidth')} dashed ${th('colorBorder')};
  cursor: pointer;
  height: ${grid(6)};
  margin-bottom: ${grid(6)};
  padding: ${grid(2)};
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
