/*
  Functions to change the shade of a color. These avoid using Color.lighten() and Color.darken() functions,
  which do not give the results one would expect (see issue https://github.com/Qix-/color/issues/53).
  These functions provide a more useful result, then, than those provided by @pubsweet/ui-toolkit.

  Examples:
  darkenBy('#641EAA', 0.3)   gives #461577
  darkenBy('#641EAA', 0.7)   gives #1E0933
  darkenBy('#641EAA', 1)     gives black
  lightenBy('#AAA', 0.7)     gives #CFCFCF
  lightenBy('#AAA', 1)       gives white
  darkenBy('rgb(255, 255, 255)', 0.2)   gives #CCC

  You can supply a valid variable defined in your theme instead:

  eg.
  darkenBy('colorPrimary', 0.3)
  lightenBy('someProperty.customColor', 0.5)
*/

import { get } from 'lodash'
import Color from 'color'

const getColor = (original, props) => {
  const color = get(props.theme, original) || original

  try {
    return Color(color)
  } catch (_) {
    return Color('black')
  }
}

export const darkenBy = (original, ratio) => props => {
  const base = getColor(original, props)
  const lightness = base.lightness()
  return base.lightness(lightness * (1 - ratio)).string()
}

export const lightenBy = (original, ratio) => props => {
  const base = getColor(original, props)
  const lightness = base.lightness()
  return base.lightness(lightness + (100 - lightness) * ratio).string()
}
