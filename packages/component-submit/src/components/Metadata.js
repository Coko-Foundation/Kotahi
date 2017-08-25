import React from 'react'
import { FormSection, Field } from 'redux-form'
import { AbstractEditor, TitleEditor } from 'xpub-edit'
import { CheckboxGroup, Menu, Tags } from 'xpub-ui'
import classes from './Metadata.local.css'

const Metadata = ({ journal }) => (
  <FormSection name="metadata">
    <div className={classes.section}>
      <Field
        name="title"
        id="title"
        component={props =>
          <TitleEditor
            placeholder="Enter the title…"
            title="Title"
            {...props.input}/>
        }/>
    </div>

    <div className={classes.section}>
      <Field
        name="abstract"
        id="abstract"
        component={props =>
          <AbstractEditor
            placeholder="Enter the abstract…"
            title="Abstract"
            {...props.input}/>
        }/>
    </div>

    <div className={classes.section}>
      <label
        className={classes.label}
        htmlFor="authors">Authors</label>
      <Field
        name="authors"
        id="authors"
        component={props =>
          <Tags placeholder="Enter an author…" {...props.input}/>
        }/>
    </div>

    <div className={classes.section}>
      <label
        className={classes.label}
        htmlFor="keywords">Keywords</label>
      <Field
        name="keywords"
        id="keywords"
        component={props =>
          <Tags placeholder="Enter a keyword…" {...props.input}/>
        }/>
    </div>

    <div className={classes.section}>
      <label
        className={classes.label}
        htmlFor="articleType">Type of article</label>
      <Field
        name="articleType"
        id="articleType"
        component={props =>
          <Menu options={journal.articleTypes} {...props.input}/>
        }/>
    </div>

    <div className={classes.section}>
      <div
        className={classes.label}
        htmlFor="articleSection">Section</div>
      <Field
        name="articleSection"
        id="articleSection"
        component={props =>
          <CheckboxGroup options={journal.articleSections} {...props.input}/>
        }/>
    </div>
  </FormSection>
)

export default Metadata
