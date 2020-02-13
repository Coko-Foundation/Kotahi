import React from 'react'
import Select from 'react-select'
import { Field } from 'formik'
import { Button } from '@pubsweet/ui'
import { required } from 'xpub-validators'
import 'react-select/dist/react-select.css'

const OptionRenderer = option => (
  <div>
    <div>{option.username}</div>
    <div>{option.email}</div>
  </div>
)

const ReviewerInput = ({
  field,
  form: { values, setFieldValue },
  push,
  replace,
  reviewerUsers,
}) => (
  <Select.Creatable
    {...field}
    labelKey="username"
    onChange={user => {
      setFieldValue('user', user)
    }}
    optionRenderer={OptionRenderer}
    options={reviewerUsers}
    promptTextCreator={label => `Add ${label}?`}
    valueKey="id"
  />
)

const ReviewerForm = ({
  reset,
  isValid,
  handleSubmit,
  onSubmit,
  reviewerUsers,
}) => (
  <form onSubmit={handleSubmit}>
    <Field
      component={ReviewerInput}
      name="user"
      reviewerUsers={reviewerUsers}
      validate={required}
    />
    <Button disabled={!isValid} primary type="submit">
      Invite reviewer
    </Button>
  </form>
)

export default ReviewerForm
