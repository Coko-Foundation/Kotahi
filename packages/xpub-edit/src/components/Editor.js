import React from 'react'
import classnames from 'classnames'
import { EditorState } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import baseClasses from 'prosemirror-view/style/prosemirror.css'

import MenuBar from './MenuBar'
import classes from './Editor.local.css'
import decorations from '../decorations'

class Editor extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      state: EditorState.create(props.options),
    }
  }

  createEditorView = node => {
    const { className } = this.props
    const { state } = this.state

    this.view = new EditorView(node, {
      state,
      dispatchTransaction: this.dispatchTransaction,
      decorations: decorations({
        props: this.props,
        classes,
      }),
      attributes: {
        class: classnames(
          baseClasses.ProseMirror,
          classes.ProseMirror,
          className,
        ),
      },
      handleDOMEvents: {
        blur: this.props.onBlur
          ? view => {
              this.props.onBlur(view.state.doc.content)
            }
          : null,
      },
    })

    if (this.props.autoFocus) {
      this.view.focus()
    }
  }

  dispatchTransaction = transaction => {
    const state = this.view.state.apply(transaction)
    this.view.updateState(state)
    this.setState({ state })
    this.props.onChange(state.doc.content)
  }

  render() {
    const { options: { menu }, title } = this.props
    const { state } = this.state

    return (
      <div>
        {menu && (
          <MenuBar
            dispatch={this.dispatchTransaction}
            menu={menu}
            state={state}
            title={title}
          />
        )}

        <div ref={this.createEditorView} />
      </div>
    )
  }
}

export default Editor
