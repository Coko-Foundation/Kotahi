import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { TextField, Button } from '@pubsweet/ui'
import { th } from '@pubsweet/ui-toolkit'
import styled from 'styled-components'

const ModalContainer = styled.div`
  background: ${th('colorBackground')};
  padding: 20px 24px;
`

const InlineTextField = styled(TextField)`
  border-color: ${props => (props.error ? '#ff2d1a' : '#AAA')};
  display: inline;
  width: calc(${th('gridUnit')} * 24);
`

const UpdateEmailError = styled.p`
  color: #ff2d1a;
  font-size: 14px;
`

const EnterEmail = ({ updateUserEmail }) => {
  const [email, setEmail] = useState('')
  const [updateEmailError, setUpdateEmailError] = useState('')

  // eslint-disable-next-line no-shadow
  const updateEmail = async email => {
    await updateUserEmail({ variables: { email } }).then(response => {
      if (!response.data.updateCurrentEmail.success) {
        setUpdateEmailError(response.data.updateCurrentEmail.error)
      } else {
        setUpdateEmailError('')
      }
    })
  }

  return (
    <ModalContainer>
      <InlineTextField
        error={updateEmailError}
        onChange={e => setEmail(e.target.value)}
        placeholder="Enter your email"
        value={email}
      />
      <br />
      {updateEmailError && (
        <UpdateEmailError>{updateEmailError}</UpdateEmailError>
      )}
      <Button onClick={() => updateEmail(email)} primary>
        Next
      </Button>
    </ModalContainer>
  )
}

EnterEmail.propTypes = {
  user: PropTypes.shape({ username: PropTypes.string.isRequired }).isRequired,
}
export default EnterEmail
