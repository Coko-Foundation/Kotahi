import React, { useState, useEffect, useRef } from 'react'
import styled from 'styled-components'
import { ChevronUp, ChevronDown } from 'react-feather'
import { LabelBadge } from '../../../shared'
import { color } from '../../../../theme'

const BaseDropdown = styled.div`
  display: inline-flex;
  position: relative;
`

const DropdownButton = styled.button`
  align-items: center;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
`

const DropdownMenu = styled.div`
  background-color: ${color.backgroundA};
  border: 1px solid #ccc;
  border-radius: 4px;
  box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.25);
  left: 0;
  max-height: 250px;
  overflow-y: auto;
  position: absolute;
  top: 100%;
  z-index: 1;
`

const CaretIcon = styled.div`
  height: 18px;
  margin-left: 8px;
  width: 18px;
`

const DropdownMenuItem = styled.div`
  cursor: pointer;
  padding: 8px;

  &:hover {
    background-color: ${color.gray97};
  }
`

const LabelDropdown = ({ values, options, manuscript, doUpdateManuscript }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const dropdownRef = useRef(null)

  const updateManuscript = (versionId, manuscriptDelta) =>
    doUpdateManuscript({
      variables: {
        id: versionId,
        input: JSON.stringify(manuscriptDelta),
      },
    })

  const handleDropdownItemClick = cuurentLabel => {
    setIsDropdownOpen(false)

    const manuscriptDelta = {
      submission: {
        labels: cuurentLabel,
      },
    }

    updateManuscript(manuscript.id, manuscriptDelta)
  }

  const handleClickOutside = event => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsDropdownOpen(false)
    }
  }

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <BaseDropdown ref={dropdownRef}>
      <DropdownButton onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
        <LabelBadge color={values[0]?.color}>
          {values[0]?.displayValue}
          {isDropdownOpen ? (
            <CaretIcon>
              <ChevronUp size={20} />
            </CaretIcon>
          ) : (
            <CaretIcon>
              <ChevronDown size={20} />
            </CaretIcon>
          )}
        </LabelBadge>
      </DropdownButton>

      {isDropdownOpen && (
        <DropdownMenu>
          {options?.map(option => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => handleDropdownItemClick(option.value)}
            >
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenu>
      )}
    </BaseDropdown>
  )
}

export default LabelDropdown
