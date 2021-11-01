import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { TextField, Button } from '@pubsweet/ui'
import { th } from '@pubsweet/ui-toolkit'
import styled from 'styled-components'

const InlineTextField = styled(TextField)`
  display: inline;
  width: calc(${th('gridUnit')} * 24);
`

const ChangeUsername = ({ user, updateCurrentUsername }) => {
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
