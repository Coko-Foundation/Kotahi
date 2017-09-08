import React from 'react'
import { FormSection } from 'redux-form'
import { TextField, ValidatedField } from 'xpub-ui'
import { join, split } from '../lib/validators'
import classes from './Suggestions.local.scss'

const joinComma = join(',')
const splitComma = split(',')

const Suggestions = () => {
  const SuggestedReviewerInput = input =>
    <TextField
      placeholder="Add reviewer names"
      {...input}/>

  const OpposedReviewerInput = input =>
    <TextField
      placeholder="Add reviewer names"
      {...input}/>

  const SuggestedEditorInput = input =>
    <TextField
      placeholder="Add editor names"
      {...input}/>

  const OpposedEditorInput = input =>
    <TextField
      placeholder="Add editor names"
      {...input}/>

  return (
    <FormSection name="suggestions">
      <div className={classes.section} id="suggestions.reviewers">
        <FormSection name="reviewers">
          <div className={classes.legend}>
            Suggested or opposed reviewers
          </div>

          <div>
            <div className={classes.sublegend}>Suggested reviewers</div>

            <ValidatedField
              name="suggested"
              format={joinComma}
              parse={splitComma}
              component={SuggestedReviewerInput}/>
          </div>

          <div>
            <div className={classes.sublegend}>Opposed reviewers</div>

            <ValidatedField
              name="opposed"
              format={joinComma}
              parse={splitComma}
              component={OpposedReviewerInput}/>
          </div>
        </FormSection>
      </div>

      <div className={classes.section} id="suggestions.editors">
        <FormSection name="editors">
          <div className={classes.legend}>
            Suggested or opposed editors
          </div>

          <div>
            <div className={classes.sublegend}>Suggested editors</div>

            <ValidatedField
              name="suggested"
              format={joinComma}
              parse={splitComma}
              component={SuggestedEditorInput}/>
          </div>

          <div>
            <div className={classes.sublegend}>Opposed editors</div>

            <ValidatedField
              name="opposed"
              format={joinComma}
              parse={splitComma}
              component={OpposedEditorInput}/>
          </div>
        </FormSection>
      </div>
    </FormSection>
  )
}

export default Suggestions
