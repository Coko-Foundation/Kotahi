/* eslint-disable no-nested-ternary */
import React, { useContext, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import ReactSelect, { components } from 'react-select'
import styled, { ThemeContext } from 'styled-components'
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

const ValueWrapper = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  flex-wrap: wrap;
  overflow: hidden;
  position: relative;
`

const getValueContainer =
  dataTestid =>
  /* eslint-disable-next-line react/function-component-definition */
  ({ children, ...props }) => {
    return (
      <components.ValueContainer {...props}>
        <ValueWrapper data-testid={dataTestid}>{children}</ValueWrapper>
      </components.ValueContainer>
    )
  }

// eslint-disable-next-line import/prefer-default-export
export const Select = props => {
  const {
    name,
    value,
    isMulti,
    options,
    customStyles,
    hasGroupedOptions = false,
    'data-testid': dataTestid,
    ...otherProps
  } = props

  const th = useContext(ThemeContext)
  const { t } = useTranslation()

  const [selectedOption, setSelectedOption] = useState(value)

  useEffect(() => {
    if (!isMulti && value) {
      if (hasGroupedOptions) {
        options.some(option => {
          const optionMatched = option.options.find(
            subOption => subOption.value === value,
          )

          optionMatched && setSelectedOption(optionMatched)

          return !!optionMatched
        })
      } else {
        setSelectedOption(options.find(option => option.value === value))
      }
    }
  }, [value, isMulti, hasGroupedOptions, options])

  const myStyles = { ...styles(th), ...(customStyles || {}) }

  return (
    <ReactSelect
      classNamePrefix="react-select"
      components={{ ValueContainer: getValueContainer(dataTestid) }}
      isMulti={isMulti}
      options={options}
      {...otherProps}
      menuPlacement="auto"
      menuPortalTarget={document.querySelector('body')}
      noOptionsMessage={() => t('common.noOption')}
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
