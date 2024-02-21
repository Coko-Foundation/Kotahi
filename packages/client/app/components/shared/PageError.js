import React from 'react'
import styled from 'styled-components'
import { th, grid } from '@pubsweet/ui-toolkit'

const ErrorBox = styled.div`
  background-color: ${th('colorFurniture')};
  border-radius: ${th('borderRadius')};
  color: #ee3333;
  font-size: ${th('fontSizeHeading5')};
  margin: ${grid(3)};
  padding: ${grid(2)} ${grid(3)};
`

const PageError = ({ errorCode }) => {
  let message

  switch (errorCode) {
    case 404:
      message = '404 Page not found.'
      break

    case 403:
      message = '403 Access denied: User privileges required.'
      break

    default:
      message =
        'Something went wrong! Please contact your system administrator for assistance.'
      break
  }

  return <ErrorBox>{message}</ErrorBox>
}

PageError.defaultProps = { errorCode: null }

export default PageError
