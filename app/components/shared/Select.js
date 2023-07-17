/* eslint-disable no-nested-ternary */
import React, { useContext } from 'react'
import PropTypes from 'prop-types'
import ReactSelect from 'react-select'
import { ThemeContext } from 'styled-components'
import { color } from '../../theme'

const styles = th => ({
  menu: (provided, state) => ({
    ...provided,
    borderRadius: th.borderRadius,
    zIndex: 9999,
    width: '100%',
    fontSize: th.fontSizeBaseSmall,
    marginTop: '4px',
  }),

  control: (provided, state) => ({
    ...provided,
    background: color.gray97,
    border: !state.selectProps.standalone
      ? state.isFocused
        ? `1px solid ${color.gray70}`
        : `1px solid ${color.gray80}`
      : 'none',
    boxShadow: !state.selectProps.standalone
      ? state.isFocused
        ? `0 0 0 1px ${color.brand1.base}`
        : 'inset 0px 0px 4px rgba(0, 0, 0, 0.07)'
      : state.isFocused
      ? `0 0 0 1px ${color.brand1.base}`
      : th.boxShadow,

    borderRadius: th.borderRadius,
    '&:hover': {
      boxShadow: `1px solid ${color.gray70}`,
    },
    fontSize: th.fontSizeBaseSmall,
    minHeight: `calc(${th.gridUnit} * 5)`,
    div: {
      color: color.gray20,
    },
  }),

  singleValue: (provided, state) => {
    const opacity = state.isDisabled ? 0.5 : 1
    const transition = 'opacity 300ms'

    return { ...provided, opacity, transition }
  },

  option: (provided, state) => ({
    ...provided,
    backgroundColor:
      state.isFocused || state.isSelected ? color.gray90 : 'white',
    color: color.text,
  }),
})

// eslint-disable-next-line import/prefer-default-export
export const Select = ({
  value,
  isMulti,
  options,
  customStyles,
  hasGroupedOptions = false,
  ...otherProps
}) => {
  const th = useContext(ThemeContext)
  let selectedOption = value

  if (!isMulti && value) {
    if (hasGroupedOptions) {
      // eslint-disable-next-line no-restricted-syntax
      for (const option of options) {
        const optionMatched = option.options.find(
          subOption => subOption.value === value,
        )

        if (optionMatched) {
          selectedOption = optionMatched
          break
        }
      }
    } else {
      selectedOption = options.find(option => option.value === value)
    }
  }

  const myStyles = { ...styles(th), ...(customStyles || {}) }

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

Select.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  value: PropTypes.any,
  isMulti: PropTypes.bool,
  options: PropTypes.arrayOf(PropTypes.any.isRequired).isRequired,
}

Select.defaultProps = {
  value: undefined,
  isMulti: false,
}
