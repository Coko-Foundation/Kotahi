import React from 'react'

export default {
  bold: <b>Bold</b>,
  heading: <span>Section Title</span>,
  italic: <i>Ital</i>,
  link: <span>Link</span>,
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
