/* eslint-disable no-nested-ternary */
import React, { useContext } from 'react'
import PropTypes from 'prop-types'
import ReactSelect from 'react-select'
import { ThemeContext } from 'styled-components'
import theme from '../../theme'

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
    background: th.colors.neutral.gray97,
    border: !state.selectProps.standalone
      ? state.isFocused
        ? `1px solid ${th.colors.neutral.gray70}`
        : `1px solid ${th.colors.neutral.gray80}`
      : 'none',
    boxShadow: !state.selectProps.standalone
      ? state.isFocused
        ? `0 0 0 1px ${th.colorPrimary}`
        : 'inset 0px 0px 4px rgba(0, 0, 0, 0.07)'
      : state.isFocused
      ? `0 0 0 1px ${th.colorPrimary}`
      : th.boxShadow,

    borderRadius: th.borderRadius,
    '&:hover': {
      boxShadow: `1px solid ${th.colors.neutral.gray70}`,
    },
    fontSize: th.fontSizeBaseSmall,
    minHeight: `calc(${th.gridUnit} * 5)`,
    div: {
      color: theme.colors.neutral.gray20,
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
      state.isFocused || state.isSelected ? th.colors.neutral.gray90 : 'white',
    color: th.colorText,
  }),
})

// eslint-disable-next-line import/prefer-default-export
export const Select = ({
  value,
  isMulti,
  options,
  customStyles,
  ...otherProps
}) => {
  const th = useContext(ThemeContext)
  let selectedOption = value

  if (!isMulti && value) {
    selectedOption = options.find(option => option.value === value)
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
