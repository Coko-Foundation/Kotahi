import React from 'react'
import { FormSection } from 'redux-form'
import { AbstractEditor, TitleEditor } from 'xpub-edit'
import { CheckboxGroup, Menu, TextField, ValidatedField } from '@pubsweet/ui'
import { withJournal } from 'xpub-journal'
import {
  join,
  required,
  minChars,
  maxChars,
  minSize,
  split,
} from 'xpub-validators'

import classes from './Metadata.local.scss'

const minSize1 = minSize(1)
const minChars20 = minChars(20)
const minChars100 = minChars(100)
const maxChars500 = maxChars(500)
const maxChars5000 = maxChars(5000)

const TitleInput = input => (
  <TitleEditor placeholder="Enter the title…" title="Title" {...input} />
)

const AbstractInput = input => (
  <AbstractEditor
    placeholder="Enter the abstract…"
    title="Abstract"
    {...input}
  />
)

const AuthorsInput = input => (
  <TextField placeholder="Enter author names…" {...input} />
)

const KeywordsInput = input => (
  <TextField placeholder="Enter keywords…" {...input} />
)

const ArticleTypeInput = journal => input => (
  <Menu options={journal.articleTypes} {...input} />
)

const ArticleSectionInput = journal => input => (
  <CheckboxGroup options={journal.articleSections} {...input} />
)

const Metadata = ({ journal, readonly }) => (
  <FormSection name="metadata">
    <div className={classes.section} id="metadata.title">
      <ValidatedField
        component={TitleInput}
        name="title"
        readonly={readonly}
        required
        validate={[minChars20, maxChars500]}
      />
    </div>

    <div className={classes.section} id="metadata.abstract">
      <ValidatedField
        component={AbstractInput}
        name="abstract"
        readonly={readonly}
        required
        validate={[minChars100, maxChars5000]}
      />
    </div>

    <div className={classes.section} id="metadata.authors">
      <div className={classes.label}>Authors</div>

      <ValidatedField
        component={AuthorsInput}
        format={join()}
        name="authors"
        parse={split()}
        readonly={readonly}
        required
        validate={[minSize1]}
      />
    </div>

    <div className={classes.section} id="metadata.keywords">
      <div className={classes.label}>Keywords</div>

      <ValidatedField
        component={KeywordsInput}
        format={join()}
        name="keywords"
        parse={split()}
        readonly={readonly}
        required
        validate={[minSize1]}
      />
    </div>

    <div className={classes.section} id="metadata.articleType">
      <div className={classes.label}>Type of article</div>

      <ValidatedField
        component={ArticleTypeInput(journal)}
        name="articleType"
        readonly={readonly}
        required
        validate={[required]}
      />
    </div>

    <div className={classes.section} id="metadata.articleSection">
      <div className={classes.label}>Section</div>

      <ValidatedField
        component={ArticleSectionInput(journal)}
        name="articleSection"
        readonly={readonly}
        required
        validate={[required]}
      />
    </div>
  </FormSection>
)

export default withJournal(Metadata)
