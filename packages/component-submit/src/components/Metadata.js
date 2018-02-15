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
import { Section, Legend } from '../styles'

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
    <Section id="metadata.title">
      <ValidatedField
        component={TitleInput}
        name="title"
        readonly={readonly}
        required
        validate={[minChars20, maxChars500]}
      />
    </Section>

    <Section id="metadata.abstract">
      <ValidatedField
        component={AbstractInput}
        name="abstract"
        readonly={readonly}
        required
        validate={[minChars100, maxChars5000]}
      />
    </Section>

    <Section id="metadata.authors">
      <Legend space>Authors</Legend>

      <ValidatedField
        component={AuthorsInput}
        format={join()}
        name="authors"
        parse={split()}
        readonly={readonly}
        required
        validate={[minSize1]}
      />
    </Section>

    <Section id="metadata.keywords">
      <Legend space>Keywords</Legend>

      <ValidatedField
        component={KeywordsInput}
        format={join()}
        name="keywords"
        parse={split()}
        readonly={readonly}
        required
        validate={[minSize1]}
      />
    </Section>

    <Section id="metadata.articleType">
      <Legend space>Type of article</Legend>

      <ValidatedField
        component={ArticleTypeInput(journal)}
        name="articleType"
        readonly={readonly}
        required
        validate={[required]}
      />
    </Section>

    <Section id="metadata.articleSection">
      <Legend space>Section</Legend>

      <ValidatedField
        component={ArticleSectionInput(journal)}
        name="articleSection"
        readonly={readonly}
        required
        validate={[required]}
      />
    </Section>
  </FormSection>
)

export default withJournal(Metadata)
