import { css, keyframes } from 'styled-components'
import { th } from '@pubsweet/ui-toolkit'

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

export default {
  Label: css``,
  Input: css``,
  Root: css`
    &:hover span {
      color: ${th('colorPrimary')};

      &:before {
        animation: ${checking} 0.5s;
        box-shadow: 0 0 0 ${localBorderTwoSize} ${th('colorPrimary')};
      }
    }
  `,
}
