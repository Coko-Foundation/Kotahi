import React, { useState } from 'react'
import PropTypes from 'prop-types'
import gql from 'graphql-tag'
import { useMutation } from '@apollo/react-hooks'
import { TextField, Button } from '@pubsweet/ui'
import { th } from '@pubsweet/ui-toolkit'
import styled from 'styled-components'

const UPDATE_CURRENT_USERNAME = gql`
  mutation updateCurrentUsername($username: String) {
    updateCurrentUsername(username: $username) {
      id
      username
    }
  }
`

const InlineTextField = styled(TextField)`
  display: inline;
  width: calc(${th('gridUnit')} * 24);
`
const ChangeUsername = ({ user }) => {
  const [updateCurrentUsername] = useMutation(UPDATE_CURRENT_USERNAME)
  const [username, setUsername] = useState(user.username)

  const updateUsername = async updatedUsername => {
    await updateCurrentUsername({ variables: { username: updatedUsername } })
  }
  return (
    <>
      <InlineTextField
        onChange={e => setUsername(e.target.value)}
        value={username}
      />
      <Button onClick={() => updateUsername(username)}>Change</Button>
    </>
  )
}

ChangeUsername.propTypes = {
  user: PropTypes.shape({ username: PropTypes.string.isRequired }).isRequired,
}
export default ChangeUsername
