import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { TextField, Button } from '@pubsweet/ui'
import { th } from '@pubsweet/ui-toolkit'
import styled from 'styled-components'

const InlineTextField = styled(TextField)`
  display: inline;
  width: calc(${th('gridUnit')} * 24);
`

const Container = styled.div`
  position: relative;
`

const WarningBox = styled.div`
  color: ${th('colorError')};
  font-size: ${th('fontSizeBaseSmall')};
  position: absolute;
  transform: translate(0, 44px);
`

const ChangeUsername = ({ user, updateCurrentUsername }) => {
  const [username, setUsername] = useState(user.username)
  // Don't permit usernames starting with a numeral or starting or ending with whitespace
  const isValid = /^[^0-9\s](?:.*\S)?$/.test(username)

  const updateUsername = async updatedUsername => {
    await updateCurrentUsername({ variables: { username: updatedUsername } })
  }

  return (
    <Container>
      {!isValid && (
        <WarningBox>
          Cannot begin with a numeral or start or end with space characters
        </WarningBox>
      )}
      <InlineTextField
        onChange={e => setUsername(e.target.value)}
        value={username}
      />
      <Button disabled={!isValid} onClick={() => updateUsername(username)}>
        Change
      </Button>
    </Container>
  )
}

ChangeUsername.propTypes = {
  user: PropTypes.shape({ username: PropTypes.string.isRequired }).isRequired,
}
export default ChangeUsername
