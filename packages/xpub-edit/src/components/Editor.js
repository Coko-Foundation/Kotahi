import React from 'react'
import classnames from 'classnames'
import { debounce, findKey } from 'lodash'
import { Editor as SlateEditor, getEventTransfer } from 'slate-react'
import EditorToolbar from './EditorToolbar'
import classes from './Editor.local.scss'

// TODO: move paste/drop handlers to plugins
// TODO: word/character count

class Editor extends React.Component {
  state = {
    state: undefined
  }

  constructor (props) {
    super(props)

    this.throttledOnDocumentChange = debounce(this.onDocumentChange, 1000)
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

  onChange = ({ state }) => {
    if (state.document !== this.state.state.document) {
      this.throttledOnDocumentChange({ state })
    }

    this.setState({ state })
  }

  onDocumentChange = ({ state }) => {
    const { converter, onDocumentChange } = this.props

    if (typeof onDocumentChange === 'function') {
      onDocumentChange(converter.serialize(state))
    }
  }

  // TODO: only fire onChange if actually changed?
  onBlur = () => {
    const { converter, onBlur } = this.props
    const { state } = this.state

    if (typeof onBlur === 'function') {
      onBlur(converter.serialize(state))
    }
  }

  onKeyDown = (event, change) => {
    const { keys } = this.props

    const mark = findKey(keys, test => test(event))

    if (!mark) return

    event.preventDefault()

    change.toggleMark(mark)

    return true
  }

  onReceive = (event, change) => {
    const transfer = getEventTransfer(event)

    switch (transfer.type) {
      case 'files':
        return this.insertFiles(event, transfer, change)

      case 'html':
        const { converter } = this.props
        const { document } = converter.deserialize(transfer.html)

        return change.insertFragment(document)

      case 'text':
        return change.insertText(transfer.text)

      case 'fragment':
        return change.insertFragment(transfer.fragment)

      default:
        throw new Error('Unknown paste type')
    }
  }

  insertFiles = (event, transfer, change) => {
    Array.from(transfer.files).forEach(file => {
      const block = {
        type: transfer.type,
        isVoid: true,
        data: {
          file,
          url: window.URL.createObjectURL(file),
          mimetype: file.type,
          name: file.name,
        }
      }

      if (event.target) {
        change.select(event.target).collapseToStartOfNextBlock()
      }

      // TODO: insert after last block

      change.insertBlock(block)
    })
  }

  render () {
    const { state } = this.state
    const { className, schema, placeholder, placeholderClassName, plugins, toolbar, title } = this.props

    if (!state) return null

    return (
      <div>
        {toolbar && (
          <EditorToolbar
            title={title}
            toolbar={toolbar}
            state={state}
            onChange={this.onChange}
            insertFiles={this.insertFiles}/>
        )}

        <SlateEditor
          className={classnames(className, classes.root)}
          schema={schema}
          state={state}
          onBlur={this.onBlur}
          onChange={this.onChange}
          onKeyDown={this.onKeyDown}
          onPaste={this.onReceive}
          onDrop={this.onReceive}
          placeholder={placeholder}
          placeholderClassName={classnames(placeholderClassName, classes.placeholder)}
          plugins={plugins}
          spellCheck
        />
      </div>
    )
  }
}

export default Editor
