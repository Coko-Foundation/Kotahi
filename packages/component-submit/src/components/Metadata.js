import React from 'react'
import { FormSection, Field } from 'redux-form'
import { AbstractEditor, TitleEditor } from 'xpub-edit'
import { CheckboxGroup, Menu, TextField, ValidatedField } from 'xpub-ui'
import { withJournal } from 'pubsweet-component-xpub-app/src/components'
import classes from './Metadata.local.scss'
import { join, required, minChars, maxChars, minSize, split } from '../lib/validators'

const Metadata = ({ journal }) => (
  <FormSection name="metadata">
    <div className={classes.section} id="metadata.title">
      <Field
        name="title"
        required
        validate={[minChars(20), maxChars(500)]}
        component={props =>
          <ValidatedField {...props.meta}>
            <TitleEditor
              placeholder="Enter the title…"
              title="Title"
              {...props.input}/>
          </ValidatedField>
        }/>
    </div>

    <div className={classes.section} id="metadata.abstract">
      <Field
        name="abstract"
        required
        validate={[minChars(100), maxChars(5000)]}
        component={props =>
          <ValidatedField {...props.meta}>
            <AbstractEditor
              title="Abstract"
              placeholder="Enter the abstract…"
              {...props.input}/>
          </ValidatedField>
        }/>
    </div>

    <div className={classes.section} id="metadata.authors">
      <div className={classes.label}>Authors</div>
      <Field
        name="authors"
        required
        format={join()}
        parse={split()}
        validate={[minSize(1)]}
        component={props =>
          <ValidatedField {...props.meta}>
            <TextField
              placeholder="Enter author names…"
              {...props.input}/>
          </ValidatedField>
        }/>
    </div>

    <div className={classes.section} id="metadata.keywords">
      <div className={classes.label}>Keywords</div>
      <Field
        name="keywords"
        required
        format={join()}
        parse={split()}
        validate={[minSize(1)]}
        component={props =>
          <ValidatedField {...props.meta}>
            <TextField
              placeholder="Enter keywords…"
              {...props.input}/>
          </ValidatedField>
        }/>
    </div>

    <div className={classes.section} id="metadata.articleType">
      <div className={classes.label}>Type of article</div>
      <Field
        name="articleType"
        required
        validate={[required]}
        component={props =>
          <ValidatedField {...props.meta}>
            <Menu options={journal.articleTypes} {...props.input}/>
          </ValidatedField>
        }/>
    </div>

    <div className={classes.section} id="metadata.articleSection">
      <div className={classes.label}>Section</div>
      <Field
        name="articleSection"
        required
        validate={[required]}
        component={props =>
          <ValidatedField {...props.meta}>
            <CheckboxGroup options={journal.articleSections} {...props.input}/>
          </ValidatedField>
        }/>
    </div>
  </FormSection>
)

export default withJournal(Metadata)
