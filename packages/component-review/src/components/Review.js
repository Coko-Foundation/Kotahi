import React from 'react'
import { Button } from 'xpub-ui'
import { NoteEditor } from 'xpub-edit'
import { Field } from 'redux-form'
import { required } from '../lib/validators'
import { RadioGroup, ValidatedField } from 'xpub-ui'
import classes from './Review.local.scss'

const Review = ({ journal, review, valid, pristine, submitting, handleSubmit, uploadFile }) => (
  <form onSubmit={handleSubmit}>
    <div className={classes.section}>
      <Field
        name="note"
        validate={[required]}
        component={props =>
          <ValidatedField {...props.meta}>
            <NoteEditor
              placeholder="Enter your review…"
              title="Review"
              {...props.input}/>
          </ValidatedField>
        }/>
    </div>

    <div className={classes.section}>
      <Field
        name="recommendation"
        validate={[required]}
        component={props =>
          <ValidatedField {...props.meta}>
            <RadioGroup
              inline
              options={journal.recommendations}
              {...props.input}/>
          </ValidatedField>
        }/>
    </div>

    <div>
      {/*<Button type="button" onClick={handleSave}>Save</Button>*/}
      <Button type="submit" primary>Submit</Button>
    </div>
  </form>
)

export default Review
