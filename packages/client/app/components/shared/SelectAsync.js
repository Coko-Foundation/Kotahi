/* eslint-disable no-nested-ternary */
import React, { useContext } from 'react'
import PropTypes from 'prop-types'
import ReactSelectAsync from 'react-select/async'
import { ThemeContext } from 'styled-components'
import { useTranslation } from 'react-i18next'
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
export const SelectAsync = ({
  isMulti,
  customStyles,
  'data-testid': dataTestid,
  ...otherProps
}) => {
  const th = useContext(ThemeContext)
  const { t } = useTranslation()

  const myStyles = { ...styles(th), ...(customStyles || {}) }

  return (
    <ReactSelectAsync
      isMulti={isMulti}
      {...otherProps}
      menuPlacement="auto"
      menuPortalTarget={document.querySelector('body')}
      noOptionsMessage={() => t('common.noOption')}
      styles={myStyles}
    />
  )
}

SelectAsync.propTypes = {
  isMulti: PropTypes.bool,
}

SelectAsync.defaultProps = {
  isMulti: false,
}
