import React from 'react'
import styled from 'styled-components'
import { th } from '@pubsweet/ui-toolkit'

const AlertSuccess = styled.div`
  background: ${th('colorSuccessLight')};
  border-left: 3px solid ${th('colorSuccess')};
  color: ${th('colorSuccessDark')};
  line-height: 1.8;
  padding: 0.5em 1em 0.5em 0.5em;
`

const AlertError = styled.div`
  background: ${th('colorWarningLight')};
  border-left: 3px solid ${th('colorWarning')};
  color: ${th('colorWarningDark')};
  line-height: 1.8;
  padding: 0.5em 1em 0.5em 0.5em;
`

const Alert = ({ children, type, detail }) => {
  if (type === 'success') {
    return <AlertSuccess title={detail}>{children}</AlertSuccess>
  }

  if (type === 'error') {
    return <AlertError title={detail}>{children}</AlertError>
  }

  throw new Error('Unknown alert type')
}

export default Alert
