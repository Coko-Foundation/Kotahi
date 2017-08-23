import React from 'react'
import { Field } from 'redux-form'
import { AbstractEditor, TitleEditor } from 'xpub-edit'
import classes from './Metadata.local.css'

const Metadata = ({ version, handleSubmit }) => (
  <form onSubmit={handleSubmit}>
    <div className={classes.section}>
      <Field
        name="title"
        value={version.title}
        component={props =>
          <TitleEditor
            placeholder="Enter the title…"
            title="Title"
            {...props}/>
        }/>
    </div>

    <div className={classes.section}>
      <Field
        name="abstract"
        value={version.abstract}
        component={props =>
          <AbstractEditor
            placeholder="Enter the abstract…"
            title="Abstract"
            {...props}/>
        }/>
    </div>
  </form>
)

export default Metadata
