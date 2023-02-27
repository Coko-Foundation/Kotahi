import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { X as CloseIcon, ChevronUp, ChevronDown } from 'react-feather'
import theme from '../../theme'

const Container = styled.div`
  display: flex;
  height: 26px;
`

const LabelContainer = styled.div`
  background: white;
  border: 1.5px solid ${theme.colors.neutral.gray70};
  box-shadow: 0px 1px 1px rgba(0, 0, 0, 0.25);
  border-radius: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  padding-right: ${props => props.showResetIcon ? '15px' : '0'};
  width: ${props => props.compact ? '50px' : '65px'}
`

const ControlsContainer = styled.div`
  margin-left: 4px;
  display: flex;
  flex-direction: column;
`

const CounterActionContainer = styled.div`
  button {
    cursor: ${props => props.disabled ? "not-allowed" : "pointer"};
    background: transparent;
    border: none;

    svg {
      color: ${props => props.disabled ? theme.colorBorder : theme.colorIconPrimary};
    }

    &:hover {
      svg {
        stroke: ${props => props.disabled ? theme.colorBorder : theme.colors.brand1.base};
      }
    }
  }
`

const CounterValueUp = styled(CounterActionContainer)`
  margin-top: -3px;
`
const CounterValueDown = styled(CounterActionContainer)`
  margin-top: -10px;
`
const CloseIconContainer = styled(CounterActionContainer)`
  cursor: ${props => props.disabled ? "not-allowed" : "pointer"};
  border-radius: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  right: 3px;
`

const CounterField = ({
  value: propsValue,
  minValue,
  onChange = () => {},
  showNone = false,
  compact = false,
  disabled = false,
}) => {
  const [value, setValue] = useState(propsValue)
  const [displayValue, setDisplayValue] = useState(propsValue === null ? 'None' : propsValue)
  const [showResetIcon, setShowResetIcon] = useState(false)
  const noneValue = null
  const defaultValue = showNone ? noneValue : (minValue || 0)

  useEffect(() => {
    setValue(propsValue)
  }, [propsValue])

  useEffect(() => {
    setDisplayValue(value === null ? 'None' : value);
    // this check is required to avoid infinite loop as `value` change leads to `propsValue`
    // change via `onChange` and then `propsChange` change leads to `value` change
    if (value !== propsValue) {
      onChange(value)
    }
    setShowResetIcon(value !== defaultValue)
  }, [value])

  const resetValue = () => {
    if (disabled) {
      return;
    }
    setValue(defaultValue)
  }

  const increaseCounter = () => {
    if (disabled) {
      return;
    }
    let updatedValue = null
    if (value === null) {
      updatedValue = 0
    } else {
      updatedValue = value + 1
    }
    setValue(updatedValue)
  }

  const decreaseCounter = () => {
    if (disabled) {
      return;
    }
    let updatedValue = null
    if (value === null) {
      updatedValue
    } else {
      updatedValue = value - 1
      if (minValue !== null && updatedValue < minValue) {
        updatedValue = showNone ? noneValue : minValue
      }
    }
    setValue(updatedValue)
  }

  return (
    <Container>
      <LabelContainer compact={compact} showResetIcon={showResetIcon}>
        <span>{displayValue}</span>
        {
          showResetIcon && <CloseIconContainer onClick={() => resetValue()} disabled={disabled}>
            <CloseIcon size={15} color={disabled ? theme.colorBorder : "black"} />
          </CloseIconContainer>
        }
      </LabelContainer>
      <ControlsContainer>
        <CounterValueUp disabled={disabled}>
          <button type="button" onClick={() => increaseCounter()}>
            <ChevronUp size={16} />
          </button>
        </CounterValueUp>
        <CounterValueDown disabled={disabled}>
          <button type="button" onClick={() => decreaseCounter()}>
            <ChevronDown size={16} />
          </button>
        </CounterValueDown>
      </ControlsContainer>
    </Container>
  )
}

export default CounterField
