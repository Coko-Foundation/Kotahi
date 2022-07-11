import styled from 'styled-components'
import { th } from '@pubsweet/ui-toolkit'

export const Info = styled.span`
  align-items: center;
  display: flex;
  height: 500px;
  justify-content: center;
  list-style: none;
  margin: 0;
  padding: 0;
`

export const PopUpH2 = styled.h2`
	font-weight bold;
  text-align: center;
  margin-bottom: 1em;
  font-size: 20px;
  margin-top: 24px;
`

export const PopUpTextContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  & p.linkurl {
    max-width: 300px;
    overflow-x: scroll;
    white-space: nowrap;
    background-color: #eeeeee;
    padding: 3px 8px;
    border-radius: 2px;
    & a {
      color: black;
    }
  }
  & p.linknote {
    text-transform: uppercase;
    color: #b91c1c;
    font-size: 12px;
    letter-spacing: 0.5px;
    margin-top: 12px;
  }
  & button.copybutton {
    margin-top: 24px;
    border: ${th('colorPrimary')} solid 1px;
    border-radius: 4px;
    color: ${th('colorPrimary')};
    text-transform: uppercase;
    padding: 12px 16px;
    background-color: white;
    cursor: pointer;
    transition: 0.25s;
    user-select: none;
    &:hover {
      color: black;
      border-color: black;
    }
  }
`

export const CloseButton = styled.span`
  --size: 24px;
  display: inline-flex;
  width: var(--size);
  height: var(--size);
  background-color: ${th('colorPrimary')};
  border-radius: 100%;
  color: white;
  user-select: none;
  justify-content: center;
  align-items: center;
  position: absolute;
  right: 10px;
  top: 10px;
  &:hover {
    cursor: pointer;
  }
  &:before {
    content: '×';
    position: relative;
    top: calc(0px - calc(var(--size) * 0.1));
    font-size: var(--size);
  }
`
