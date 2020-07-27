import React from 'react'
import { Field } from 'formik'
import { Button } from '@pubsweet/ui'
import { required } from 'xpub-validators'
import styled from 'styled-components'
// import 'react-select1/dist/react-select.css'
import { grid } from '@pubsweet/ui-toolkit'
import { Select } from '../../../../shared'

const OptionRenderer = option => (
  <div>
    <div>{option.username}</div>
    <div>{option.email}</div>
  </div>
)

const FieldAndButton = styled.div`
  display: grid;
  grid-template-columns: ${grid(30)} ${grid(10)};
  grid-gap: ${grid(2)};
`
const ReviewerInput = ({
  field,
  form: { values, setFieldValue },
  push,
  replace,
  reviewerUsers,
}) => (
  <Select
    {...field}
    aria-label="Invite reviewers"
    getOptionLabel={option => option.defaultIdentity?.name}
    getOptionValue={option => option.id}
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
    <FieldAndButton>
      <Field
        component={ReviewerInput}
        name="user"
        reviewerUsers={reviewerUsers}
        validate={required}
      />
      <Button disabled={!isValid} primary type="submit">
        Invite reviewer
      </Button>
    </FieldAndButton>
  </form>
)

export default ReviewerForm
