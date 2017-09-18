import React from 'react'
import { FormSection } from 'redux-form'
import { AbstractEditor, TitleEditor } from 'xpub-edit'
import { CheckboxGroup, Menu, TextField, ValidatedField } from 'xpub-ui'
import { withJournal } from 'xpub-journal'
import classes from './Metadata.local.scss'
import { join, required, minChars, maxChars, minSize, split } from 'xpub-validators'

const minSize1 = minSize(1)
const minChars20 = minChars(20)
const minChars100 = minChars(100)
const maxChars500 = maxChars(500)
const maxChars5000 = maxChars(5000)

const TitleInput = input =>
  <TitleEditor
    placeholder="Enter the title…"
    title="Title"
    {...input}/>

const AbstractInput = input =>
  <AbstractEditor
    title="Abstract"
    placeholder="Enter the abstract…"
    {...input}/>

const AuthorsInput = input =>
  <TextField
    placeholder="Enter author names…"
    {...input}/>

const KeywordsInput = input =>
  <TextField
    placeholder="Enter keywords…"
    {...input}/>

const ArticleTypeInput = journal => input =>
  <Menu
    options={journal.articleTypes}
    {...input}/>

const ArticleSectionInput = journal => input =>
  <CheckboxGroup
    options={journal.articleSections}
    {...input}/>

const Metadata = ({ journal }) => (
  <FormSection name="metadata">
    <div className={classes.section} id="metadata.title">
      <ValidatedField
        name="title"
        required
        validate={[minChars20, maxChars500]}
        component={TitleInput}/>
    </div>

    <div className={classes.section} id="metadata.abstract">
      <ValidatedField
        name="abstract"
        required
        validate={[minChars100, maxChars5000]}
        component={AbstractInput}/>
    </div>

    <div className={classes.section} id="metadata.authors">
      <div className={classes.label}>Authors</div>

      <ValidatedField
        name="authors"
        required
        format={join()}
        parse={split()}
        validate={[minSize1]}
        component={AuthorsInput}/>
    </div>

    <div className={classes.section} id="metadata.keywords">
      <div className={classes.label}>Keywords</div>

      <ValidatedField
        name="keywords"
        required
        format={join()}
        parse={split()}
        validate={[minSize1]}
        component={KeywordsInput}/>
    </div>

    <div className={classes.section} id="metadata.articleType">
      <div className={classes.label}>Type of article</div>

      <ValidatedField
        name="articleType"
        required
        validate={[required]}
        component={ArticleTypeInput(journal)}/>
    </div>

    <div className={classes.section} id="metadata.articleSection">
      <div className={classes.label}>Section</div>

      <ValidatedField
        name="articleSection"
        required
        validate={[required]}
        component={ArticleSectionInput(journal)}/>
    </div>
  </FormSection>
)

export default withJournal(Metadata)
