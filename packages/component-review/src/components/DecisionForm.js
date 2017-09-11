import React from 'react'
import { Button } from 'xpub-ui'
import { NoteEditor } from 'xpub-edit'
import { RadioGroup, ValidatedField } from 'xpub-ui'
import { withJournal } from 'xpub-journal'
import { required } from '../lib/validators'
import classes from './DecisionForm.local.scss'

const DecisionForm = ({journal, decision, valid, handleSubmit, uploadFile}) => {
  const NoteInput = input =>
    <NoteEditor
      placeholder="Enter your decision…"
      title="Decision"
      {...input}/>

  const RecommendationInput = input =>
    <RadioGroup
      inline
      required
      options={journal.recommendations}
      {...input}/>

  return (
    <form onSubmit={handleSubmit}>
      <div className={classes.section}>
        <ValidatedField
          name="note"
          validate={[required]}
          component={NoteInput}/>
      </div>

      <div className={classes.section}>
        <ValidatedField
          name="recommendation"
          validate={[required]}
          component={RecommendationInput}/>
      </div>

      <div>
        {/*<Button type="button" onClick={handleSave}>Save</Button>*/}
        <Button type="submit" primary>Submit</Button>
      </div>
    </form>
  )
}

export default withJournal(DecisionForm)
