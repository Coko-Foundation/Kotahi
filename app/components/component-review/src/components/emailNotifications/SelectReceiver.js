import React from 'react'
import styled from 'styled-components'
import { Checkbox, TextField } from '@pubsweet/ui'

import { Select } from '../../../../shared'

const InputField = styled(TextField)`
  height: 40px;
  margin-bottom: 0;
`

const SelectReceiver = ({
  onChangeReceiver,
  selectedReceiver,
  options,
  isNewUser,
  setIsNewUser,
  externalEmail,
  externalName,
  setExternalEmail,
  setExternalName,
}) => {
  return (
    <>
      <Checkbox checked={isNewUser} label="New User" onChange={setIsNewUser} />
      {!isNewUser && (
        <Select
          aria-label="Choose receiver"
          label="Choose receiver"
          onChange={selected => {
            onChangeReceiver(selected.value)
          }}
          options={options}
          placeholder="Choose receiver"
          value={selectedReceiver}
          width="100%"
        />
      )}
      {isNewUser && (
        <>
          <InputField
            onChange={e => setExternalEmail(e.target.value)}
            placeholder="Email"
            value={externalEmail}
          />
          <InputField
            onChange={e => setExternalName(e.target.value)}
            placeholder="Name"
            value={externalName}
          />
        </>
      )}
    </>
  )
}

// SelectReceiver.propTypes = {
//   setSelectedReceiver: PropTypes.func.isRequired,
// }

export default SelectReceiver
