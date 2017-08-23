import React from 'react'

// define the items in the toolbar

export default {
  marks: [
    {
      type: 'bold',
      label: 'Bold',
      button: <b>Bold</b>,
    },
    {
      type: 'italic',
      label: 'Italic',
      button: <i>Italic</i>,
    },
    {
      type: 'superscript',
      label: 'Superscript',
      button: <span>x<sup>2</sup></span>,
    },
    {
      type: 'subscript',
      label: 'Subscript',
      button: <span>x<sub>2</sub></span>,

    },
    // {
    //   type: 'smallcaps',
    //   label: 'Small Caps',
    //   button: <span style={{ fontVariant: 'small-caps' }}>small caps</span>,
    // }
  ],
  nodes: [
    {
      type: 'heading',
      label: 'Heading',
      button: <span>Section Title</span>,
    },
  ]
}
