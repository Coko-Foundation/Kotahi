/* stylelint-disable string-quotes */

import { css, keyframes } from 'styled-components'
import { grid, th } from '@coko/client'

const checking = keyframes`
  0% {
    transform: scale(0.8);
  }

  20% {
    transform: scale(1.2);
  }

  80% {
    transform: scale(1);
  }

  100% {
    transform: scale(1);
  }
`

export default {
  Root: css`
    &:hover {
      span {
        color: ${props =>
          props.checked ? 'inherit' : props.theme.color.brand1.base};

        &::before {
          animation-duration: ${th('transitionDuration')};
          animation-name: ${props => (props.checked ? 'none' : checking)};
          box-shadow: 0 0 0 ${th('borderWidth')}
            ${props =>
              props.checked ? 'currentColor' : props.theme.color.brand1.base};
        }
      }
    }
  `,
  Label: css`
    font-style: italic;

    &::before {
      background: ${props => (props.checked ? 'currentColor' : 'transparent')};

      /* This is not a real border (box-shadow provides that), so not themed as such */
      border: ${grid(0.5)} solid white;
      border-radius: 50%;
      box-shadow: 0 0 0 ${th('borderWidth')} currentColor;

      color: ${props => (props.color ? props.color : props.theme.color.text)};
      content: ' ';
      display: inline-block;
      height: ${grid(4)};
      margin-left: ${grid(2)};
      margin-right: ${grid(2)};

      transition: border ${th('transitionDuration')}
        ${th('transitionTimingFunction')};

      vertical-align: middle;
      width: ${grid(4)};
    }
  `,
  Input: css`
    clip-path: inset(50%);
    height: 1px;
    margin: -1px;
    overflow: hidden;
    position: absolute;
    white-space: nowrap;
    width: 1px;
  `,
}
