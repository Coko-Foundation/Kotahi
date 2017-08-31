import React from 'react'
import { FormSection, Field } from 'redux-form'
import { AbstractEditor, TitleEditor } from 'xpub-edit'
import { CheckboxGroup, Menu, Tags, ValidatedField } from 'xpub-ui'
import classes from './Metadata.local.css'
import { required, minChars, maxChars, minSize } from '../lib/validators'

const Metadata = ({ journal, validators }) => (
  <FormSection name="metadata">
    <div className={classes.section} id="metadata.title">
      <Field
        name="title"
        normalize={value => value.replace(/^<p><\/p>$/, '')}
        validate={[required]}
        warn={[minChars(20), maxChars(500)]}
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
        normalize={value => String(value).replace(/^<p><\/p>$/, '')}
        validate={[required]}
        warn={[minChars(100), maxChars(5000)]}
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
        validate={[required]}
        warn={[minSize(1)]}
        component={props =>
          <ValidatedField {...props.meta}>
            <Tags
              placeholder="Enter an author…"
              {...props.input}/>
          </ValidatedField>
        }/>
    </div>

    <div className={classes.section} id="metadata.keywords">
      <div className={classes.label}>Keywords</div>
      <Field
        name="keywords"
        validate={[required]}
        warn={[minSize(1)]}
        component={props =>
          <ValidatedField {...props.meta}>
            <Tags
              placeholder="Enter a keyword…"
              {...props.input}/>
          </ValidatedField>
        }/>
    </div>

    <div className={classes.section} id="metadata.articleType">
      <div className={classes.label}>Type of article</div>
      <Field
        name="articleType"
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
        validate={[required]}
        component={props =>
          <ValidatedField {...props.meta}>
            <CheckboxGroup options={journal.articleSections} {...props.input}/>
          </ValidatedField>
        }/>
    </div>
  </FormSection>
)

export default Metadata
