import React from 'react'
import { Editor as SlateEditor, Plain } from 'slate'
import EditorToolbar from './EditorToolbar'

// TODO: move paste/drop handlers to plugins
// TODO: word/character count

class Editor extends React.Component {
  state = {
    state: undefined
  }

  componentDidMount () {
    this.deserialize(this.props.value)
  }

  /*
  componentWillUpdate (nextProps) {
    if (nextProps.value !== this.props.value) {
      this.deserialize(nextProps.value)
    }
  }
  */

  deserialize (value) {
    this.setState({
      state: this.props.converter.deserialize(value || '')
    })
  }

  transform = callback => {
    const { state } = this.state

    const transform = state.transform()

    callback(transform)

    // TODO: call editor.onChange(state) instead?

    this.setState({
      state: transform.apply()
    })
  }

  onChange = (state) => {
    this.setState({ state })
  }

  // TODO: debouncing?
  // TODO: only fire on onBlur or onSubmit?
  // TODO: send an event?
  onDocumentChange = (document, state) => {
    // this.props.onChange(null, this.props.converter.serialize(state))
  }

  onKeyDown = (event, { isMod, key }, state) => {
    const { keys } = this.props

    if (!isMod || !keys[key]) return

    event.preventDefault()

    return state.transform().toggleMark(keys[key]).apply()
  }

  onReceive = (event, data, state, editor) => {
    switch (data.type) {
      case 'files':
        return this.insertFiles(data, state, editor)

      case 'html':
        // if (this.props.converter instanceof Plain) {
        //   return this.insertPastedContent(data.text, state)
        // }

        return this.insertPastedContent(data.html, state)

      case 'text':
        return this.insertPastedContent(data.text, state)

      default:
        throw new Error('Unknown paste type')
    }
  }

  insertPastedContent = (content, state) => {
    const { document } = this.props.converter.deserialize(content)

    return state.transform().insertFragment(document).apply()
  }

  insertFiles = (type, data) => {
    Array.from(data.files).forEach(file => {
      const block = {
        type,
        isVoid: true,
        data: {
          file,
          url: window.URL.createObjectURL(file),
          mimetype: file.type,
          name: file.name,
        }
      }

      this.transform(transform => {
        if (data.target) {
          transform.select(data.target).collapseToStartOfNextBlock()
        }

        // TODO: insert after last block

        transform.insertBlock(block)
      })
    })
  }

  render () {
    const { state } = this.state
    const { className, schema, placeholder, toolbar, title } = this.props

    if (!state) return null

    return (
      <div>
        {toolbar && (
          <EditorToolbar
            title={title}
            toolbar={toolbar}
            state={state}
            transform={this.transform}
            insertFiles={this.insertFiles}/>
        )}

        <SlateEditor
          className={className}
          schema={schema}
          state={state}
          onChange={this.onChange}
          onKeyDown={this.onKeyDown}
          onPaste={this.onReceive}
          onDrop={this.onReceive}
          onDocumentChange={this.onDocumentChange}
          placeholder={placeholder}
          spellCheck
        />
      </div>
    )
  }
}

export default Editor
