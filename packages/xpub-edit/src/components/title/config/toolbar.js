import React from 'react'

// define the items in the toolbar

export default {
  marks: [
    {
			type: 'italic',
      label: 'Italic',
      button: <i>Ital</i>,
    },
    {
      type: 'superscript',
      label: 'Superscript',
      button: <span>t<sup>x</sup></span>,
    },
    {
      type: 'subscript',
      label: 'Subscript',
      button: <span>t<sub>x</sub></span>,

    },
    // {
    //   type: 'smallcaps',
    //   label: 'Small Caps',
    //   button: <span style={{fontVariant:'small-caps'}}>sc</span>,
    // }
  ]
}
