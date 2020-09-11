import { css } from 'styled-components'
import { th, grid } from '@pubsweet/ui-toolkit'

export default {
  Input: css`
    border-color: ${props => {
      switch (props.validationStatus) {
        case 'success':
          return props.theme.colorBorder
        case 'warning':
          return props.theme.colorWarning
        case 'error':
          return props.theme.colorError
        default:
          return props.theme.colorBorder
      }
    }};
    color: ${props => {
      switch (props.validationStatus) {
        case 'success':
          return props.theme.colorText
        case 'warning':
          return props.theme.colorWarning
        case 'error':
          return props.theme.colorError
        default:
          return 'inherit'
      }
    }};
    outline: 0;
    transition: ${th('transitionDuration')} ${th('transitionTimingFunction')};

    &:focus {
      box-shadow: ${th('boxShadow')};
      border-color: ${props => {
        switch (props.validationStatus) {
          case 'success':
            return props.theme.colorSuccess
          case 'warning':
            return props.theme.colorWarning
          case 'error':
            return props.theme.colorError
          default:
            return props.theme.colorPrimary
        }
      }};
      color: inherit;
    }

    &::placeholder {
      font-size: ${th('fontSizeBaseSmall')};
      line-height: ${th('lineHeightBaseSmall')};
    }
  `,

  Label: css`
    margin-bottom: ${grid(1)};
  `,
}
