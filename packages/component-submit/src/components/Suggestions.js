import React from 'react'
import { FormSection } from 'redux-form'
import { TextField, ValidatedField } from '@pubsweet/ui'
import { join, split } from 'xpub-validators'
import classes from './Suggestions.local.scss'

const joinComma = join(',')
const splitComma = split(',')

const SuggestedReviewerInput = input => (
  <TextField placeholder="Add reviewer names" {...input} />
)

const OpposedReviewerInput = input => (
  <TextField placeholder="Add reviewer names" {...input} />
)

const SuggestedEditorInput = input => (
  <TextField placeholder="Add editor names" {...input} />
)

const OpposedEditorInput = input => (
  <TextField placeholder="Add editor names" {...input} />
)

const Suggestions = ({ readonly }) => (
  <FormSection name="suggestions">
    <div className={classes.section} id="suggestions.reviewers">
      <FormSection name="reviewers">
        <div className={classes.legend}>Suggested or opposed reviewers</div>

        <div>
          <div className={classes.sublegend}>Suggested reviewers</div>

          <ValidatedField
            component={SuggestedReviewerInput}
            format={joinComma}
            name="suggested"
            parse={splitComma}
            readonly={readonly}
          />
        </div>

        <div>
          <div className={classes.sublegend}>Opposed reviewers</div>

          <ValidatedField
            component={OpposedReviewerInput}
            format={joinComma}
            name="opposed"
            parse={splitComma}
            readonly={readonly}
          />
        </div>
      </FormSection>
    </div>

    <div className={classes.section} id="suggestions.editors">
      <FormSection name="editors">
        <div className={classes.legend}>Suggested or opposed editors</div>

        <div>
          <div className={classes.sublegend}>Suggested editors</div>

          <ValidatedField
            component={SuggestedEditorInput}
            format={joinComma}
            name="suggested"
            parse={splitComma}
            readonly={readonly}
          />
        </div>

        <div>
          <div className={classes.sublegend}>Opposed editors</div>

          <ValidatedField
            component={OpposedEditorInput}
            format={joinComma}
            name="opposed"
            parse={splitComma}
            readonly={readonly}
          />
        </div>
      </FormSection>
    </div>
  </FormSection>
)

export default Suggestions
