import Color from 'color'
import lightenBy from '../shared/lightenBy'

const defaultBrandColor1 = '#2fac66'
const defaultBrandColor2 = '#704f79'

const validateInstanceConfigColors = (colorCode, fallbackColor) => {
  try {
    Color(colorCode)
    return colorCode
  } catch (err) {
    return fallbackColor || defaultBrandColor1
  }
}

let colorBrand1 = defaultBrandColor1
let colorBrand2 = defaultBrandColor2

/** Colors are named with round numbers for ease of use. Actual lightness values may differ. */
const color = {
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

  text: '#111111',
  textReverse: '#FFFFFF',
  textPlaceholder: '#666666',

  backgroundA: '#FFFFFF',
  backgroundB: '#f9fafb',
  backgroundC: '#f4f5f7',

  brand1: {
    shade50: () => Color(colorBrand1).darken(0.52),
    shade25: () => Color(colorBrand1).darken(0.27),
    shade15: () => Color(colorBrand1).darken(0.17),
    shade10: () => Color(colorBrand1).darken(0.11),
    base: () => colorBrand1,
    tint10: () => lightenBy(colorBrand1, 0.1),
    tint25: () => lightenBy(colorBrand1, 0.26),
    tint50: () => lightenBy(colorBrand1, 0.53),
    tint70: () => lightenBy(colorBrand1, 0.73),
    tint90: () => lightenBy(colorBrand1, 0.93),
  },
  brand2: {
    shade50: () => Color(colorBrand2).darken(0.52),
    shade25: () => Color(colorBrand2).darken(0.27),
    shade15: () => Color(colorBrand2).darken(0.17),
    shade10: () => Color(colorBrand2).darken(0.11),
    base: () => colorBrand2,
    tint10: () => lightenBy(colorBrand2, 0.1),
    tint25: () => lightenBy(colorBrand2, 0.26),
    tint50: () => lightenBy(colorBrand2, 0.53),
    tint70: () => lightenBy(colorBrand2, 0.73),
    tint90: () => lightenBy(colorBrand2, 0.93),
  },

  success: {
    tint90: '#D7EFD4',
    tint50: '#88CE7F',
    tint25: '#61BE55',
    base: '#39AE2A',
    shade50: '#1E8112',
  },
  warning: {
    tint90: '#E6E5D8',
    tint50: '#E1C45A',
    tint25: '#D3A43D',
    base: '#C5831F',
    shade50: '#622811',
  },
  error: {
    tint90: '#D9D1D1',
    tint50: '#CD8D8E',
    tint25: '#EC3E3E',
    base: '#D22B2B',
    shade50: '#7F1D1D',
  },
  additional: {
    blue: '#71AED2',
    purple: '#615CCF',
    aqua: '#7ED3A6',
    green: '#89D46C',
    mustard: '#CCD66E',
  },
}

export const setBrandColors = (color1, color2) => {
  colorBrand1 = validateInstanceConfigColors(color1, defaultBrandColor1)
  colorBrand2 = validateInstanceConfigColors(color2, defaultBrandColor2)
}

setBrandColors()

export default color
