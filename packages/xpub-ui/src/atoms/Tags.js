import React from 'react'
import ReactTags from 'react-tag-autocomplete'
import './Tags.css'

// TODO: separate tags when pasted
// TODO: allow tags to be edited

class Tags extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      tags: props.value || []
    }
  }

  handleDelete = index => {
    const { tags } = this.state

    tags.splice(index, 1)

    this.setState({ tags })

    this.props.onChange(tags)
  }

  handleAddition = tag => {
    const { tags } = this.state

    tags.push(tag)

    this.setState({ tags })

    this.props.onChange(tags)
  }

  // TODO: fire change event on state change

  render () {
    const { tags } = this.state
    const { name, suggestions, placeholder } = this.props

    return (
      <ReactTags
        name={name}
        tags={tags}
        suggestions={suggestions}
        placeholder={placeholder}
        autofocus={false}
        allowNew={true}
        // TODO: enable these when react-tag-autocomplete update is released
        // delimiters={[]}
        // delimiterChars={[',', ';']}
        handleDelete={this.handleDelete}
        handleAddition={this.handleAddition}/>
    )
  }
}

export default Tags
