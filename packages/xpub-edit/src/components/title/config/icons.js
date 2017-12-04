import React from 'react'

export default {
  italic: <i>Ital</i>,
  superscript: (
    <span>
      t<sup>x</sup>
    </span>
  ),
  subscript: (
    <span>
      t<sub>x</sub>
    </span>
  ),
  small_caps: (
    <span>
      T<span style={{ fontVariant: 'small-caps', fontSize: '70%' }}>T</span>
    </span>
  ),
}
