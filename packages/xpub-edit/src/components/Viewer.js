import React from 'react'
import classnames from 'classnames'
import { EditorState } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import baseClasses from 'prosemirror-view/style/prosemirror.css'
import { withViewerStyle } from './withStyles'

class Viewer extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      state: EditorState.create(props.options),
    }
  }

  componentDidUpdate(props) {
    const newState = EditorState.create(props.options)
    this.view.updateState(newState)
  }

  createEditorView = node => {
    const { className } = this.props
    const { state } = this.state

    this.view = new EditorView(node, {
      state,
      dispatchTransaction: () => false,
      attributes: {
        class: classnames(baseClasses.ProseMirror, className),
      },
    })
  }

  render() {
    return <div ref={this.createEditorView} />
  }
}

export default withViewerStyle(Viewer)
