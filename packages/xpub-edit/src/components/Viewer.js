import React from 'react'
import classnames from 'classnames'
import { EditorState } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import baseClasses from 'prosemirror-view/style/prosemirror.css'
import classes from './Editor.local.css'

class Viewer extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      state: EditorState.create(props.options),
    }
  }

  createEditorView(node) {
    const { state } = this.state

    this.view = new EditorView(node, {
      state,
      dispatchTransaction: () => false,
      attributes: {
        class: classnames(baseClasses.ProseMirror, classes.ProseMirror),
      },
    })
  }

  render() {
    return <div ref={this.createEditorView} />
  }
}

export default Viewer
