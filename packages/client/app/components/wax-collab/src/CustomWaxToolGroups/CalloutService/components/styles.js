/* stylelint-disable no-descending-specificity, string-quotes */
import React from 'react'
import styled from 'styled-components'
import {
  Button as OriginalButton,
  Checkbox as OriginalCheckbox,
} from '../../../../../pubsweet'
import { color } from '../../../../../../theme'

export const Wrapper = styled.span`
  background-color: ${color.gray95};
  user-select: none;
`

export const PopUpWrapper = styled.div`
  background: white;
  border-radius: 5px;

  & p.ref {
    font-size: 14px;
    line-height: 22.4px;
    margin: 0;
    outline: none;
  }

  & p.cite {
    font-size: 14px;
    line-height: 22.4px;
    margin: 0;
    outline: none;
  }

  & > div > h4 {
    color: ${color.brand1.base};
    font-size: 30px;
    margin: 0;
    padding: 15px;
  }

  & > div > h4 > p {
    color: ${color.text};
    font-size: 14px;
    line-height: 22.4px;
    margin-top: 6px;
  }
`

export const PopUpContent = styled.div`
  height: 370px;
  overflow-y: auto;
`

export const Button = styled(OriginalButton)`
  border: 2px solid ${color.brand1.base};
  border-radius: 4px;
  cursor: pointer;
  padding: 4px 8px;
  text-decoration: none;
  transition: 0.25s;
  user-select: none;

  &[type='primary'] {
    background-color: ${color.brand1.base};
    color: white;

    &:hover {
      border-color: white;
    }
  }

  & + button {
    margin-left: 16px;
  }

  &:hover {
    border-color: #444;
  }

  &:disabled:hover {
    border-color: ${color.brand1.base};
  }
`

export const Checkbox = styled(OriginalCheckbox)`
  accent-color: ${color.brand1.base};
`

export const CalloutOptionWrapper = styled.label`
  align-items: center;
  background-color: white;
  border-bottom: 1px solid ${color.gray80};
  border-radius: 3px;
  border-top: 1px solid ${color.gray80};
  cursor: pointer;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 10px 16px;

  & input {
    accent-color: ${color.brand1.base};
  }

  &.selected {
    background-color: ${color.gray95};
  }

  &.static {
    color: ${color.gray40};
  }

  & > button {
    margin-right: 1em;
  }

  & > p {
    align-self: flex-end;
    font-size: 75%;
    margin: 0 0 0 16px;
  }

  & > div {
    margin-right: auto;

    & > p.ref {
      margin: 0 10px;
    }

    & > p.cite {
      margin: 0 10px;
    }
  }
`

export const StatusBar = styled.p`
  display: flex;
  justify-content: flex-end;
  padding: 10px;
`

export const CloseButton = styled.span`
  align-items: center;
  background-color: ${color.brand1.base};
  border-radius: 100%;
  color: white;
  cursor: pointer;
  display: inline-flex;
  height: 32px;
  justify-content: center;
  position: absolute;
  right: 0;
  text-align: center;
  top: 0;
  user-select: none;
  width: 32px;
`

export const CloseButtonIcon = () => (
  <svg
    height="24"
    viewBox="0 0 24 24"
    width="24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M0 0h24v24H0V0z" fill="none" />
    <path
      d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"
      fill="white"
    />
  </svg>
)
