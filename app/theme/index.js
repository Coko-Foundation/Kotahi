/* eslint-disable import/extensions */

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

import brandConfig from '../brandConfig.json'

const validateInstanceConfigColors = colorCode => {
  const defaultInstanceColor = '#2fac66'
  const hexaDecimalRegex = /^#[0-9A-F]{6}$/i
  const shortHexaDecimalRegex = /^#([0-9A-F]{3}){1,2}$/i

  if (colorCode.length <= 4) {
    return colorCode.match(shortHexaDecimalRegex)
      ? colorCode
      : defaultInstanceColor
  }

  return colorCode.match(hexaDecimalRegex) ? colorCode : defaultInstanceColor
}

const cokoTheme = {
  /* Colors */
  colorBackground: 'white',
  colorSecondaryBackground: '#f9fafb', // custom
  colorPrimary: validateInstanceConfigColors(brandConfig.primaryColor),
  colorSecondary: validateInstanceConfigColors(brandConfig.secondaryColor),
  colorFurniture: '#E8E8E8',
  colorBorder: '#AAA',
  colorBackgroundHue: '#f4f5f7',
  colorSuccess: '#008800',
  colorError: '#FF2D1A',
  colorText: '#111',
  colorTextReverse: '#FFF',
  colorTextPlaceholder: '#595959',
  colorWarning: '#ffc107',

  /* Text variables */

  // fonts
  fontInterface:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'",
  fontHeading:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'",
  fontReading:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'",
  fontWriting:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'",

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
  borderRadius: '8px',
  borderWidth: '1px', // julien: not 0
  borderStyle: 'solid',

  // Does not exist
  // $borderColor: var($colorFurniture);

  /* Shadow (for tooltip) */
  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 4px 0 rgba(0, 0, 0, 0.06)',
  // boxShadow: '4px 4px 16px #cdcdcd',
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
  },
}

export default cokoTheme
