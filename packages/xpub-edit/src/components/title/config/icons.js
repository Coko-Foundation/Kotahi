import React from 'react'

export default {
  italic: <i>Ital</i>,
  small_caps: (
    <span>
      T<span style={{ fontSize: '70%', fontVariant: 'small-caps' }}>T</span>
    </span>
  ),
  subscript: (
    <span>
      t<sub>x</sub>
    </span>
  ),
  superscript: (
    <span>
      t<sup>x</sup>
    </span>
  ),
}
