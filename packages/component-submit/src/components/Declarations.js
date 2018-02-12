import React from 'react'
import classnames from 'classnames'
import { FormSection } from 'redux-form'
import { ValidatedField, RadioGroup } from '@pubsweet/ui'
import { withJournal } from 'xpub-journal'
import { required } from 'xpub-validators'
import classes from './Declarations.local.scss'

const DeclarationInput = options => input => (
  <RadioGroup inline options={options} {...input} />
)

const Declarations = ({ journal, readonly }) => (
  <FormSection name="declarations">
    {journal.declarations.questions.map(question => (
      <div
        className={classnames(
          classes.section,
          classes.spread,
          !readonly && classes.spreadEnabled,
        )}
        id={`declarations.${question.id}`}
        key={question.id}
      >
        <div className={classes.legend}>{question.legend}</div>
        <ValidatedField
          component={DeclarationInput(question.options)}
          name={question.id}
          readonly={readonly}
          required
          validate={[required]}
        />
      </div>
    ))}
  </FormSection>
)

export default withJournal(Declarations)
