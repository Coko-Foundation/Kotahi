import React from 'react'
import { Editor as SlateEditor } from 'slate-react'
import classes  from './Viewer.local.scss'

class Viewer extends React.Component {
  state = {
    state: undefined
  }

  componentDidMount () {
    this.deserialize(this.props.value)
  }

  componentWillUpdate (nextProps) {
    if (nextProps.value !== this.props.value) {
      this.deserialize(nextProps.value)
    }
  }

  deserialize (value) {
    this.setState({
      state: this.props.converter.deserialize(value || '')
    })
  }

  render () {
    const { state } = this.state
    const { schema } = this.props

    if (!state) return null

    return (
      <SlateEditor
        className={classes.root}
        schema={schema}
        state={state}
        readOnly/>
    )
  }
}

export default Viewer
