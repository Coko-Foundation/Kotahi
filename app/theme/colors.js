import Color from 'color'
import brandConfig from '../brandConfig.json'
import lightenBy from '../shared/lightenBy'

const defaultInstanceColor = '#2fac66'

const validateInstanceConfigColors = colorCode => {
  try {
    Color(colorCode)
    return colorCode
  } catch (err) {
    return defaultInstanceColor
  }
}

const colorBrand1 = validateInstanceConfigColors(brandConfig.primaryColor)
const colorBrand2 = validateInstanceConfigColors(brandConfig.secondaryColor)

const colors = {
  /** Colors are named with round numbers for ease of use. Actual lightness values may differ. */
  neutral: {
    black: '#000000',
    gray0: '#000000',
    gray5: '#111111', // 7%: colorText
    gray10: '#191919', // 10%
    gray20: '#323232', // 20%
    gray30: '#4F4F4F', // 30%
    // gray35: '#595959', // 35%: colorTextPlaceholder
    gray40: '#666666', // 40%: colorIconPrimary
    gray50: '#888888', // 53%
    gray60: '#A5A5A5', // 65%: near colorBorder:#AAAAAA
    gray70: '#BFBFBF', // 75%
    gray80: '#DEDEDE', // 87%: colorContainerBorder
    gray90: '#E8E8E8', // 91%: colorFurniture
    gray95: '#EEEEEE', // 93%
    gray97: '#F8F8F9', // 97%
    gray99: '#FCFCFD', // 99%
    gray100: '#FFFFFF',
    white: '#FFFFFF',
  },
  brand1: {
    shade50: Color(colorBrand1).darken(0.52),
    shade25: Color(colorBrand1).darken(0.27),
    base: colorBrand1,
    tint10: lightenBy(colorBrand1, 0.1),
    tint25: lightenBy(colorBrand1, 0.26),
    tint50: lightenBy(colorBrand1, 0.53),
    tint90: lightenBy(colorBrand1, 0.93),
  },
  brand2: {
    shade50: Color(colorBrand2).darken(0.52),
    shade25: Color(colorBrand2).darken(0.27),
    base: colorBrand2,
    tint10: lightenBy(colorBrand2, 0.1),
    tint25: lightenBy(colorBrand2, 0.26),
    tint50: lightenBy(colorBrand2, 0.53),
    tint90: lightenBy(colorBrand2, 0.93),
  },
  success: {
    50: '#D7EFD4',
    300: '#88CE7F',
    500: '#61BE55',
    700: '#39AE2A',
    900: '#1E8112',
  },
  warning: {
    50: '#E6E5D8',
    300: '#E1C45A',
    500: '#D3A43D',
    700: '#C5831F',
    900: '#622811',
  },
  error: {
    50: '#D9D1D1',
    300: '#CD8D8E',
    500: '#EC3E3E',
    700: '#D22B2B',
    900: '#7F1D1D',
  },
  additional: {
    blue: '#71AED2',
    purple: '#615CCF',
    aqua: '#7ED3A6',
    green: '#89D46C',
    mustard: '#CCD66E',
  },
}

export default colors
