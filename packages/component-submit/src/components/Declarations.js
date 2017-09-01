import React from 'react'
import classnames from 'classnames'
import { FormSection, Field } from 'redux-form'
import { ValidatedField, YesOrNo } from 'xpub-ui'
import { required } from '../lib/validators'
import classes from './Declarations.local.css'

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

        <Field
          name={question.id}
          required
          validate={[required]}
          component={props =>
            <ValidatedField {...props.meta}>
              <YesOrNo inline={true} {...props.input}/>
            </ValidatedField>
          }/>
      </div>
    ))}
  </FormSection>
)

export default Declarations
