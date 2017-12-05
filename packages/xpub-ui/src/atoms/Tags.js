import React from 'react'
import ReactTags from 'react-tag-autocomplete'
import './Tags.scss'

// TODO: separate tags when pasted
// TODO: allow tags to be edited

class Tags extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      tags: props.value || [],
    }
  }

  handleDelete(index) {
    const { tags } = this.state

    tags.splice(index, 1)

    this.setState({ tags })

    this.props.onChange(tags)
  }

  handleAddition(tag) {
    const { tags } = this.state

    tags.push(tag)

    this.setState({ tags })

    this.props.onChange(tags)
  }

  render() {
    const { tags } = this.state
    const { name, suggestions, placeholder } = this.props

    return (
      <ReactTags
        allowNew
        autofocus={false}
        // TODO: enable these when react-tag-autocomplete update is released
        // delimiters={[]}
        // delimiterChars={[',', ';']}
        handleAddition={this.handleAddition}
        handleDelete={this.handleDelete}
        name={name}
        placeholder={placeholder}
        suggestions={suggestions}
        tags={tags}
      />
    )
  }
}

export default Tags
