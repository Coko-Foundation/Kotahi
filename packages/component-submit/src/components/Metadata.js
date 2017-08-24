import React from 'react'
import { Field } from 'redux-form'
import { AbstractEditor, TitleEditor } from 'xpub-edit'
import { Tags } from 'xpub-ui'
import classes from './Metadata.local.css'

const Metadata = ({ version, handleSubmit }) => (
  <form onSubmit={handleSubmit}>
    <div className={classes.section}>
      <Field
        name="title"
        id="title"
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
        id="abstract"
        value={version.abstract}
        component={props =>
          <AbstractEditor
            placeholder="Enter the abstract…"
            title="Abstract"
            {...props}/>
        }/>
    </div>

    <div className={classes.section}>
      <label
        className={classes.label}
        htmlFor="keywords">Keywords</label>
      <Field
        name="keywords"
        id="keywords"
        value={version.keywords}
        component={props =>
          <Tags placeholder="Enter a keyword…" {...props}/>
        }/>
    </div>

    <div className={classes.section}>
      <label
        className={classes.label}
        htmlFor="authors">Authors</label>
      <Field
        name="authors"
        id="authors"
        value={version.authors}
        component={props =>
          <Tags placeholder="Enter an author…" {...props}/>
        }/>
    </div>
  </form>
)

export default Metadata
