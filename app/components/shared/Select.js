import React, { useContext } from 'react'
import ReactSelect from 'react-select'
import { ThemeContext } from 'styled-components'

const styles = th => ({
  menu: (provided, state) => ({
    ...provided,
    borderRadius: th.borderRadius,
  }),

  control: (provided, state) => ({
    ...provided,
    border: state.isFocused
      ? `1px solid ${th.colorPrimary}`
      : `1px solid ${th.colorBorder}`,
    boxShadow: state.isFocused ? `0 0 0 1px ${th.colorPrimary}` : 'none',
    borderRadius: th.borderRadius,
    '&:hover': {
      boxShadow: `0 0 0 1px ${th.colorPrimary}`,
    },
    minHeight: `calc(${th.gridUnit} * 5)`,
  }),

  singleValue: (provided, state) => {
    const opacity = state.isDisabled ? 0.5 : 1
    const transition = 'opacity 300ms'

    return { ...provided, opacity, transition }
  },

  option: (provided, state) => ({
    ...provided,
    backgroundColor:
      state.isFocused || state.isSelected ? th.colorFurniture : 'white',
    color: th.colorText,
  }),
})

export const Select = props => {
  const theme = useContext(ThemeContext)
  return <ReactSelect {...props} styles={styles(theme)} />
}
