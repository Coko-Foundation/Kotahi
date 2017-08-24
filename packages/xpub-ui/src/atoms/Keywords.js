import React from 'react'
import ReactTags from 'react-tag-autocomplete'
import './Keywords.css'

class Keywords extends React.Component {
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
  }

  handleAddition = tag => {
    const { tags } = this.state

    tags.push(tag)

    this.setState({ tags })
  }

  // TODO: fire change event on state change

  render () {
    const { tags } = this.state
    const { suggestions, placeholder } = this.props

    return (
      <ReactTags
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

export default Keywords
