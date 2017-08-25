import React from 'react'
import { FormSection, Field } from 'redux-form'
import { Tags } from 'xpub-ui'
import classes from './Suggestions.local.css'

const Suggestions = () => (
  <FormSection name="suggestions">
    <div className={classes.section}>
      <FormSection name="reviewers">
        <div className={classes.legend}>
          Suggested or opposed reviewers
        </div>

        <div className={classes.inline}>
          <label htmlFor="suggestedReviewers">Suggested reviewers</label>

          <Field
            name="suggested"
            id="suggestedReviewers"
            component={props => (
              <Tags
                placeholder="Add a reviewer"
                {...props.input}/>
            )}/>
        </div>

        <div className={classes.inline}>
          <label htmlFor="opposedReviewers">Opposed reviewers</label>

          <Field
            name="opposed"
            id="opposedReviewers"
            component={props => (
              <Tags
                placeholder="Add a reviewer"
                {...props.input}/>
            )}/>
        </div>
      </FormSection>
    </div>

    <div className={classes.section}>
      <FormSection name="editors">
        <div className={classes.legend}>
          Suggested or opposed editors
        </div>

        <div className={classes.inline}>
          <label htmlFor="suggestedEditors">Suggested editors</label>

          <Field
            name="suggested"
            id="suggestedEditors"
            component={props => (
              <Tags
                placeholder="Add an editor"
                {...props.input}/>
            )}/>
        </div>

        <div className={classes.inline}>
          <label htmlFor="opposedEditors">Opposed editors</label>

          <Field
            name="opposed"
            id="opposedEditors"
            component={props => (
              <Tags
                placeholder="Add an editor"
                {...props.input}/>
            )}/>
        </div>
      </FormSection>
    </div>
  </FormSection>
)

export default Suggestions
