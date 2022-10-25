import React, { useContext, useState, useRef } from 'react'
import styled, { ThemeContext } from 'styled-components'
import { X } from 'react-feather'
import { th } from '@pubsweet/ui-toolkit'
import { TightRow } from './Containers'
import MinimalButton from './MinimalButton'

const InputRow = styled(TightRow)`
  & svg {
    display: none;
  }

  &:focus-within svg {
    display: block;
  }

  &:focus-within button:focus {
    display: none;
  }
`

const Input = styled.input`
  background: none;
  border: none;
  border-radius: ${th('borderRadius')};
  flex: 1 1;
  font-family: ${th('fontInterface')};
  font-size: ${th('fontSizeBase')};
  line-height: ${th('lineHeightBase')};
  padding: 0 2px;

  &:hover,
  &:focus {
    outline: 1px solid ${th('colorPrimary')};
  }
`

const ReadOnly = styled.div`
  font-family: ${th('fontInterface')};
  font-size: ${th('fontSizeBase')};
  line-height: ${th('lineHeightBase')};
  padding: 0 2px;
`

const MinimalTextInput = ({
  autoFocus,
  isReadOnly,
  value,
  onCancel,
  onChange,
  placeholder,
  fieldId,
}) => {
  const themeContext = useContext(ThemeContext)
  const [currentVal, setCurrentVal] = useState(value)
  const inputRef = useRef()

  if (isReadOnly) return <ReadOnly>{value}</ReadOnly>

  const tryCommitValue = () => {
    if (currentVal && currentVal !== value) onChange(currentVal)
    else setCurrentVal(value)
  }

  const revertValue = () => {
    setCurrentVal(value)
    if (onCancel) onCancel()
  }

  const cancelButtonId = `${fieldId}_cancel`

  return (
    <InputRow>
      <Input
        autoFocus={autoFocus}
        onBlur={e => {
          if (e.relatedTarget?.id === cancelButtonId) return
          if (!currentVal) revertValue()
          else tryCommitValue()
        }}
        onChange={e => setCurrentVal(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter' && currentVal) {
            tryCommitValue()
            e.target.blur()
          } else if (e.key === 'Escape') {
            revertValue()
            e.target.blur()
          } else if (e.key === 'Tab') {
            if (currentVal) tryCommitValue()
            else revertValue()
          }
        }}
        placeholder={placeholder}
        ref={inputRef}
        type="text"
        value={currentVal}
      />
      <MinimalButton id={cancelButtonId} onClick={revertValue}>
        <X
          color={themeContext.colorTextPlaceholder}
          size={16}
          strokeWidth={3.5}
        />
      </MinimalButton>
    </InputRow>
  )
}

export default MinimalTextInput
