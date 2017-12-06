import React from 'react'
import { DOMParser } from 'prosemirror-model'

import Viewer from './Viewer'

const parser = schema => {
  const parser = DOMParser.fromSchema(schema)

  return content => {
    const container = document.createElement('article')
    container.innerHTML = content
    return parser.parse(container)
  }
}

class HtmlViewer extends React.Component {
  componentWillMount() {
    const { value, options } = this.props
    const { schema } = options

    const parse = parser(schema)

    options.doc = parse(value)
  }

  render() {
    const { options, className } = this.props

    return <Viewer className={className} options={options} />
  }
}

export default HtmlViewer
