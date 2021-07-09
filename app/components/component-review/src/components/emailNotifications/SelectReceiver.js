import React from 'react'
import { StyledTypeahead } from '../style'

const SelectReceiver = ({ onChangeReceiver, selectedReceiver, options }) => {
  return (
    <StyledTypeahead
      maxVisible={2}
      value={selectedReceiver}
      onKeyUp={e => {
        onChangeReceiver(e.target.value)
      }}
      onOptionSelected={selected => {
        onChangeReceiver(options.filter(option => selected === option.label)[0].value)
      }}
      options={options.map(option => option.label)}
      placeholder="Choose a receiver"
    />
  )
}

// SelectReceiver.propTypes = {
//   setSelectedReceiver: PropTypes.func.isRequired,
// }

export default SelectReceiver
