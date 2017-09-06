import React from 'react'
import { Button } from 'xpub-ui'
import { NoteEditor } from 'xpub-edit'
import { RadioGroup, ValidatedField } from 'xpub-ui'
import { withJournal } from 'pubsweet-component-xpub-app/src/components'
import { required } from '../lib/validators'
import classes from './Decision.local.scss'

const Decision = ({journal, decision, valid, handleSubmit, uploadFile}) => (
  <form onSubmit={handleSubmit}>
    <div className={classes.section}>
      <ValidatedField
        name="note"
        validate={[required]}
        component={input =>
          <NoteEditor
            placeholder="Enter your decision…"
            title="Decision"
            {...input}/>
        }/>
    </div>

    <div className={classes.section}>
      <ValidatedField
        name="recommendation"
        validate={[required]}
        component={input =>
          <RadioGroup
            inline
            options={journal.recommendations}
            {...input}/>
        }/>
    </div>

    <div>
      {/*<Button type="button" onClick={handleSave}>Save</Button>*/}
      <Button type="submit" primary>Submit</Button>
    </div>
  </form>
)

export default withJournal(Decision)
