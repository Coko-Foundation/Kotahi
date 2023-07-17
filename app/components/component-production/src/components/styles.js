import styled from 'styled-components'
import { color } from '../../../../theme'

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
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 1em;
  margin-top: 24px;
  text-align: center;
`

export const PopUpTextContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;

  & p.linkurl {
    background-color: ${color.gray95};
    border-radius: 2px;
    max-width: 300px;
    overflow-x: scroll;
    padding: 3px 8px;
    white-space: nowrap;

    & a {
      color: ${color.text};
    }
  }

  & p.linknote {
    color: #b91c1c;
    font-size: 12px;
    letter-spacing: 0.5px;
    margin-top: 12px;
    text-transform: uppercase;
  }

  & button.copybutton {
    background-color: ${color.backgroundA};
    border: ${color.brand1.base} solid 1px;
    border-radius: 4px;
    color: ${color.brand1.base};
    cursor: pointer;
    margin-top: 24px;
    padding: 12px 16px;
    text-transform: uppercase;
    transition: 0.25s;
    user-select: none;

    &:hover {
      border-color: ${color.text};
      color: ${color.text};
    }
  }
`

export const CloseButton = styled.span`
  align-items: center;
  background-color: ${color.brand1.base};
  border-radius: 100%;
  color: ${color.textReverse};
  display: inline-flex;
  height: var(--size);
  justify-content: center;
  position: absolute;
  right: 10px;
  top: 10px;
  user-select: none;
  width: var(--size);
  --size: 24px;

  &:hover {
    cursor: pointer;
  }

  &:before {
    content: '×';
    font-size: var(--size);
    position: relative;
    top: calc(0px - calc(var(--size) * 0.1));
  }
`
