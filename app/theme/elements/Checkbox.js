import { css, keyframes } from 'styled-components'
import { th, grid } from '@pubsweet/ui-toolkit'

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
const localBorderSize = '3px'

const localBorderTwoSize = '1px'

// TODO: Make Checkboxes prettier, e.g. Chakra UI for inspiration
export default {
  Label: css`

  &:before {
    //   background: ${props =>
      props.checked ? th('colorPrimary') : 'transparent'};

    //   content: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 14 14' focusable='false' role='presentation'%3E%3Cg fill='${props =>
      props.checked
        ? 'white'
        : 'transparent'}'%3E%3Cpolygon points='5.5 11.9993304 14 3.49933039 12.5 2 5.5 8.99933039 1.5 4.9968652 0 6.49933039'%3E%3C/polygon%3E%3C/g%3E%3C/svg%3E");
    //   width: 16px;
    //   height: 16px;
    //   margin-right: ${grid(1)};

    //   color: currentcolor;
    //   display: inline-block;
    //   vertical-align: middle;
    //   flex-shrink: 0;
    //   backface-visibility: hidden;

    //   // // border: ${localBorderSize} solid white;
    //   // box-shadow: 0 0 0 ${localBorderTwoSize} currentColor;

    //   transition: border 0.5s ease, background-size 0.3s ease;
    // }
  `,
  Input: css`
    // clip: rect(0, 0, 0, 0);
    // overflow: hidden;
    // height: 1px;
    // width: 1px;
    // white-space: nowrap;
    // position: absolute;
    // margin: -1px;

    // &:focus + span:before {
    //   box-shadow: 0 0 ${th('borderWidth')} calc(${th('borderWidth')} * 2)
    //     ${th('colorPrimary')};
    // }
  `,
  Root: css`
    &:hover span {
      color: blue;
      color: ${th('colorPrimary')};

      &:before {
        animation: ${checking} 0.5s;
        box-shadow: 0 0 0 ${localBorderTwoSize} ${th('colorPrimary')};
      }
    }
  `,
}
