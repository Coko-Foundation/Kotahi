import React from 'react'
import { StyledTypeahead } from '../style'
import 'react-bootstrap-typeahead/css/Typeahead.css'

const SelectReceiver = ({ onChangeReceiver, selectedReceiver, options }) => {
  return (
    <StyledTypeahead
      id='receiver-typeahead'
      value={selectedReceiver}
      onInputChange={value => {
        onChangeReceiver(value)
      }}
      onChange={selected => {
        if (selected.length) {
          onChangeReceiver(options.filter(option => selected[0] === option.label)[0].value )
        }
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
