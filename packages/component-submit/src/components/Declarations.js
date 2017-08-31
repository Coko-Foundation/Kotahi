import React from 'react'
import classnames from 'classnames'
import { FormSection, Field } from 'redux-form'
import { YesOrNo } from 'xpub-ui'
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
          component={props => <YesOrNo inline={true} {...props.input}/>}/>
      </div>
    ))}
  </FormSection>
)

export default Declarations
