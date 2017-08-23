import React from 'react'

// define the mapping from Slate node to React component
// NOTE: the value can be a React component, a style object, or a classname string

export default {
  marks: {
    'italic': props => <i>{props.children}</i>,
    'superscript': props => <sup>{props.children}</sup>,
    'subscript': props => <sub>{props.children}</sub>,
    // 'smallcaps': props => <span style={{fontVariant:'smallcaps'}}>{props.children}</span>,
  }
}
