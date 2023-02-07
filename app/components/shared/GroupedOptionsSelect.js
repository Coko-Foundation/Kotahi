import React, { useContext } from 'react'
import ReactSelect from 'react-select'
import { ThemeContext } from 'styled-components'

const styles = th => ({
  container: (provided, state) => ({
    ...provided,
    width: '100%',
    height: '45px',
    backgroundColor: '#F8F8F9',
    border: '1px solid #DEDEDE',
    borderRadius: '6px',
    boxShadow: 'inset 0px 0px 4px rgba(0, 0, 0, 0.25)',

  }),
  indicatorSeparator: (provided, state) => ({ ...provided, display: 'none' }),
  indicatorsContainer: (provided, state) => ({
    ...provided,
    height: 'fit-client',
    width: 'fit-client',
  }),
  dropdownIndicator: (provided, state) => ({
    ...provided,
    margin: '0 -3px',
    padding: '0',
  }),
  clearIndicator: (provided, state) => ({
    ...provided,
    margin: '0 -2px',
    padding: '0',
  }),
  menu: (provided, state) => ({
    ...provided,
    borderRadius: th.borderRadius,
    zIndex: 9999,
    width: 250,
  }),
  control: (provided, state) => ({
    ...provided,
    background: 'none',
    border: 'none',
    borderRadius: th.borderRadius,
    boxShadow: state.isFocused ? `0 0 0 1px ${th.colorPrimary}` : 'none',
    minHeight: '0',
    height: '100%',
    width: '100%',
    paddingLeft: '9px',
    paddingRight: '9px',
  }),

  singleValue: (provided, state) => {
    const opacity = state.isDisabled ? 0.5 : 1
    const transition = 'opacity 300ms'

    return { ...provided, opacity, transition, height: '18px' }
  },

  option: (provided, state) => ({
    ...provided,
    backgroundColor:
      state.isFocused || state.isSelected ? th.colorFurniture : 'white',
    color: th.colorText,
  }),
  valueContainer: (provided, state) => ({
    ...provided,
    height: '45px',
    padding: '0',
  }),
})

// eslint-disable-next-line import/prefer-default-export
export const GroupedOptionsSelect = ({
  value,
  isMulti,
  options,
  customStyles,
  dropdownState,
  ...otherProps
}) => {
  const theme = useContext(ThemeContext)
  let selectedOption = value

  if (!isMulti && value) {
    // eslint-disable-next-line no-restricted-syntax
    for (const optionType of options) {
      // eslint-disable-next-line no-restricted-syntax
      for (const index of optionType.options) {
        if (index.value === value) {
          selectedOption = index
        }
      }
    }
  }

  if (dropdownState) selectedOption = dropdownState

  const myStyles = { ...styles(theme), ...(customStyles || {}) }

  return (
    <ReactSelect
      isMulti={isMulti}
      options={options}
      {...otherProps}
      menuPlacement="auto"
      styles={myStyles}
      value={selectedOption}
    />
  )
}

export default GroupedOptionsSelect
