/* eslint-disable import/extensions */
import { css } from 'styled-components'
import {
  Action,
  ActionGroup,
  AppBar,
  Button,
  Checkbox,
  GlobalStyle,
  Radio,
  TextField,
  Menu,
  Logo,
} from './elements'
import lightenBy from '../shared/lightenBy'
import colors from './colors'
import spacing from './spacing'
import typography from './typography'

// Fonts
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'
import '@fontsource/roboto/900.css'
import '@fontsource/roboto/400-italic.css'

const cokoTheme = {
  colors,
  spacing,
  typography,

  /* Colors */
  // TODO Deprecate these in favour of definitions in colors.js
  colorBackground: 'white',
  colorSecondaryBackground: '#f9fafb', // custom
  colorPrimary: colors.brand1.base,
  colorSecondary: colors.brand2.base,
  colorFurniture: '#E8E8E8',
  colorBorder: '#AAA',
  colorBackgroundHue: '#f4f5f7',
  colorSuccess: '#008800',
  colorError: '#FF2D1A',
  colorText: '#111',
  colorTextReverse: '#FFF',
  colorTextPlaceholder: '#595959',
  colorWarning: '#ffc107',
  colorWarningLight: '#fff9ed',
  colorWarningDark: '#503303',
  colorSuccessLight: '#d2ffcc',
  colorSuccessDark: '#17510F',
  colorIconPrimary: '#6C6C6C',
  colorContainerBorder: '#DEDEDE',

  /* Text variables */

  // fonts
  fontInterface:
    "Roboto, -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'",
  fontHeading:
    "Roboto, -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'",
  fontReading:
    "Roboto, -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'",
  fontWriting:
    "Roboto, -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'",

  // font sizes
  fontSizeBase: '16px',
  fontSizeBaseSmall: '14px',
  fontSizeHeading1: '40px',
  fontSizeHeading2: '36px',
  fontSizeHeading3: '28px',
  fontSizeHeading4: '24px',
  fontSizeHeading5: '20px',
  fontSizeHeading6: '16px',

  // line heights
  lineHeightBase: '24px',
  lineHeightBaseSmall: '16px',
  lineHeightHeading1: '48px',
  lineHeightHeading2: '40px',
  lineHeightHeading3: '32px',
  lineHeightHeading4: '32px',
  lineHeightHeading5: '24px',
  lineHeightHeading6: '24px',

  /* Spacing */
  gridUnit: '8px',

  /* Border */
  borderRadius: '6px',
  borderWidth: '1px', // julien: not 0
  borderStyle: 'solid',

  // Does not exist
  // $borderColor: var($colorFurniture);

  /* Shadow (for tooltip) */
  boxShadow: {
    inset: 'inset 0px 0px 4px rgba(0, 0, 0, 0.07)',
    shades: {
      100: '0 2px 6px 0 rgba(0, 0, 0, 0.05)',
      200: '0 2px 6px 0 rgba(0, 0, 0, 0.1)',
      300: '0 2px 6px 0 rgba(0, 0, 0, 0.2)',
    },
  },

  /* Transition */
  transitionDuration: '0.2s', // TODO -- julien: not 0.05s
  transitionTimingFunction: 'ease',
  transitionDelay: '0',
  /* Breakpoints */
  breakpoints: [480, 768, 1000, 1272],

  cssOverrides: {
    Login: {
      Logo,
    },
    ui: {
      Action,
      ActionGroup,
      AppBar,
      Button,
      Checkbox,
      GlobalStyle,
      Radio,
      TextField,
      Menu,
    },
    Wax: {
      MenuButton: css`
        color: #111;
        margin: 2px;
        padding: 1px;

        > svg {
          fill: #333;
        }
      `,
      CharactersListComponent: css`
        padding: 0;
      `,
      SpecialCharactersGroup: css`
        padding: 0px;
      `,
      GroupTitle: css`
        font-size: 85%;
        letter-spacing: 2pt;
        margin: 4px 12px;
        padding: 0;
        text-transform: uppercase;

        :first-child {
          margin-top: 0;
        }
      `,
      SpecialCharacterButton: css`
        align-items: center;
        background-color: #eee;
        border: none;
        border-radius: 9px;
        color: #333;
        display: flex;
        height: auto;
        justify-content: center;
        margin: 4px;
        min-width: 1px;
        padding: 0 4px 3px;
        width: auto;

        &:hover {
          background-color: ${lightenBy('colorPrimary', 0.4)};
        }

        & span {
          color: inherit;
          display: block;
          font-size: 18px;

          &:hover {
            color: inherit;
          }
        }
      `,
    },
  },
}

export default cokoTheme
