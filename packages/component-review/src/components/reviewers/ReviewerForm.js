import React from 'react'
import Select from 'react-select'
import { Field } from 'redux-form'
import { Button } from 'xpub-ui'
import { required } from 'xpub-validators'
import 'react-select/dist/react-select.css'
import classes from './ReviewerForm.local.scss'

const OptionRenderer = option => (
  <div>
    <div>{option.username}</div>
    <div>{option.email}</div>
  </div>
)

const ReviewerInput = loadOptions => ({ input }) => (
  <Select.AsyncCreatable
    {...input}
    valueKey="id"
    labelKey="username"
    filterOption={() => true}
    loadOptions={loadOptions}
    promptTextCreator={label => `Add ${label}?`}
    optionRenderer={OptionRenderer}
    // autoload={false}
  />
)

const ReviewerForm = ({ reset, valid, handleSubmit, onSubmit, loadOptions }) => (
  <form onSubmit={handleSubmit(onSubmit(reset))}>
    <Field
      name="user"
      validate={required}
      component={ReviewerInput(loadOptions)}/>

    <div className={classes.actions}>
      <Button type="submit" primary disabled={!valid}>Invite reviewer</Button>
    </div>
  </form>
)

export default ReviewerForm
