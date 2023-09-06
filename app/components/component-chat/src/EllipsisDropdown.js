import React, { useEffect, useRef } from 'react'
import styled from 'styled-components'
import { color } from '../../../theme'

const DropdownContainer = styled.div`
  background-color: ${color.backgroundA};
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  position: absolute;
  right: 0px;
  width: 176px;
  z-index: 1000;
`

const DropdownItem = styled.div`
  border: 1px solid #ccc;
  color: ${color.text};
  cursor: pointer;
  font-size: 16px;
  padding: 8px;
  position: relative;
  z-index: 2;
`

const EllipsisDropdown = ({
  show,
  isMuted,
  toggleChannelMuteStatus,
  toggleDropdown,
}) => {
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = event => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        toggleDropdown()
      }
    }

    window.addEventListener('click', handleClickOutside)

    return () => {
      window.removeEventListener('click', handleClickOutside)
    }
  }, [show])

  return (
    <>
      {show && (
        <DropdownContainer ref={dropdownRef}>
          <DropdownItem onClick={toggleChannelMuteStatus}>
            {isMuted ? 'Unmute channel' : 'Mute channel'}
          </DropdownItem>
        </DropdownContainer>
      )}
    </>
  )
}

export default EllipsisDropdown
