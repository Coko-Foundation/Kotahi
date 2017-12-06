import React from 'react'
import debounce from 'lodash/debounce'
import { DOMParser, DOMSerializer } from 'prosemirror-model'

import Editor from './Editor'

const parser = schema => {
  const parser = DOMParser.fromSchema(schema)

  return content => {
    const container = document.createElement('article')
    container.innerHTML = content
    return parser.parse(container)
  }
}

const serializer = schema => {
  const serializer = DOMSerializer.fromSchema(schema)

  return content => {
    const container = document.createElement('article')
    container.appendChild(serializer.serializeFragment(content))
    return container.innerHTML
  }
}

class HtmlEditor extends React.Component {
  componentWillMount() {
    const { value, onChange, onBlur, options } = this.props
    const { schema } = options

    const parse = parser(schema)
    const serialize = serializer(schema)

    options.doc = parse(value)

    this.onChange = debounce(
      value => {
        onChange(serialize(value))
      },
      1000,
      { maxWait: 5000 },
    )

    this.onBlur = value => {
      onBlur(serialize(value))
    }
  }

  render() {
    const {
      options,
      className,
      placeholder,
      placeholderClassName,
      title,
      readonly,
    } = this.props

    return (
      <Editor
        className={className}
        onBlur={this.onBlur}
        onChange={this.onChange}
        options={options}
        placeholder={placeholder}
        placeholderClassName={placeholderClassName}
        readonly={readonly}
        title={title}
      />
    )
  }
}

export default HtmlEditor
