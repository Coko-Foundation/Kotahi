import React from 'react'
import { Field } from 'redux-form'
import { TitleEditor } from 'xpub-edit'

const Metadata = ({ version, handleSubmit }) => (
  <form onSubmit={handleSubmit}>
    <label>
      Title
      <Field name="title" value={version.title} component={props =>
        <TitleEditor
          placeholder="Enter the title…"
          title="Title"
          {...props}/>
      }/>
    </label>
  </form>
)

export default Metadata
