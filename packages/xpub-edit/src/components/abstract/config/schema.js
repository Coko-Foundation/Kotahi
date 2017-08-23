import React from 'react'
import { Block } from 'slate'

const defaultBlock = {
  type: 'paragraph',
  isVoid: false,
  data: {}
}

// define the mapping from Slate node to React component
// NOTE: the value can be a React component, a style object, or a classname string

// const marks = {
//   bold: {
//     fontWeight: 'bold'
//   },
//   code: {
//     fontFamily: 'monospace',
//     backgroundColor: '#eee',
//     padding: '3px',
//     borderRadius: '4px'
//   },
//   italic: {
//     fontStyle: 'italic'
//   },
//   underline: {
//     textDecoration: 'underline'
//   }
// }

export default {
  marks: {
    'bold': props => <b>{props.children}</b>,
    'italic': props => <i>{props.children}</i>,
    'superscript': props => <sup>{props.children}</sup>,
    'subscript': props => <sub>{props.children}</sub>,
    // 'smallcaps': props => <span style={{ fontVariant: 'smallcaps' }}>{props.children}</span>,
  },
  nodes: {
    'heading': props => <h1>{props.children}</h1>,
    // 'paragraph': props => <p {...props.attributes}>{props.children}</p>,
  },
  rules: [
    // Rule to insert a paragraph block if the document is empty.
    {
      match: node => node.kind === 'document',
      validate: (document) => {
        return document.nodes.size ? null : true
      },
      normalize: (transform, document) => {
        const block = Block.create(defaultBlock)
        transform.insertNodeByKey(document.key, 0, block)
      }
    },

    // Rule to insert a paragraph below a void node (e.g. an image) if that node is the last one in the document.
    {
      match: (node) => {
        return node.kind === 'document'
      },
      validate: (document) => {
        const lastNode = document.nodes.last()
        return lastNode && lastNode.isVoid ? true : null
      },
      normalize: (transform, document) => {
        const block = Block.create(defaultBlock)
        transform.insertNodeByKey(document.key, document.nodes.size, block)
      }
    }
  ]
}
