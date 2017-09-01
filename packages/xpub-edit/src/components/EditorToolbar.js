import React from 'react'
import classes from './EditorToolbar.local.scss'

// TODO: move file input to a separate component

class EditorToolbar extends React.Component {
  onClickMark = event => {
    event.preventDefault()

    const type = event.currentTarget.dataset.type

    this.props.transform(transform => {
      transform.toggleMark(type)
    })
  }

  onClickBlock = event => {
    event.preventDefault()

    const type = event.currentTarget.dataset.type

    this.props.transform(transform => {
      switch (type) {
        case 'bulleted-list':
        case 'numbered-list':
          if (this.isList()) {
            if (this.isType(type)) {
              transform
                .setBlock('paragraph')
                .unwrapBlock(type)
            } else {
              transform
                .unwrapBlock(type === 'numbered-list' ? 'bulleted-list' : 'numbered-list')
                .wrapBlock(type)
            }
          } else {
            transform
              .setBlock('list-item')
              .wrapBlock(type)
          }

          break

        case 'file':
        case 'image':
          this.openFilePicker(type)
          break

        default:
          transform
            .setBlock(this.hasBlock(type) ? 'paragraph' : type)

          if (this.isList()) {
            transform
              .unwrapBlock('bulleted-list')
              .unwrapBlock('numbered-list')
          }

          break
      }
    })
  }

  hasMark = type => {
    const { state } = this.props

    return state.marks.some(mark => mark.type === type)
  }

  hasBlock = type => {
    const { state } = this.props

    return state.blocks.some(node => node.type === type)
  }

  isList () {
    return this.hasBlock('list-item')
  }

  isType (type) {
    const { state } = this.props

    return state.blocks.some(block => {
      return !!state.document.getClosest(block.key, parent => parent.type === type)
    })
  }

  openFilePicker = type => {
    if (type === 'image') {
      this.filePicker.dataset.filetype = 'image'
      this.filePicker.accept = 'image/*'
    } else {
      this.filePicker.dataset.filetype = 'file'
      this.filePicker.removeAttribute('accept')
    }

    this.filePicker.value = this.filePicker.defaultValue
    this.filePicker.click()
  }

  onFileInputChange = event => {
    event.preventDefault()

    const type = event.currentTarget.dataset.filetype || 'file'

    this.props.insertFiles(type, {
      files: event.currentTarget.files
    })
  }

  render () {
    const { toolbar, title } = this.props

    return (
      <div>
        <div className={classes.toolbar}>
          {title && (
            <div className={classes.title}>{title}</div>
          )}

          <div className={classes.buttons}>
            {toolbar.marks && toolbar.marks.map(({ type, label, button }) => (
              <button
                key={type}
                className={classes.button}
                onMouseDown={this.onClickMark}
                type="button"
                data-type={type}
                data-active={this.hasMark(type)}>{button}</button>
            ))}

            {toolbar.nodes && toolbar.nodes.map(({ type, label, button }) => (
              <button
                key={type}
                className={classes.button}
                onMouseDown={this.onClickBlock}
                type="button"
                data-type={type}
                data-active={this.hasBlock(type)}>{button}</button>
            ))}
          </div>
        </div>

        <input
          type="file"
          ref={input => (this.filePicker = input)}
          onChange={this.onFileInputChange}
          style={{ display: 'none' }}/>
      </div>
    )
  }
}

export default EditorToolbar
