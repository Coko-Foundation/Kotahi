import React from 'react'
import classnames from 'classnames'
import { FormSection } from 'redux-form'
import { ValidatedField, YesOrNo } from 'xpub-ui'
import { withJournal } from 'xpub-journal'
import { required, minChars } from '../lib/validators'
import classes from './Declarations.local.scss'

const Declarations = ({ journal }) => (
  <FormSection name="declarations">
    {journal.declarations.questions.map(question => (
      <div
        key={question.id}
        id={`declarations.${question.id}`}
        className={classnames(classes.section, classes.spread)}>
        <div className={classes.legend}>
          { question.legend }
        </div>

        <ValidatedField
          name={question.id}
          required
          validate={[required]}
          component={input =>
            <YesOrNo inline={true} {...input}/>
          }/>
      </div>
    ))}
  </FormSection>
)

export default withJournal(Declarations)
