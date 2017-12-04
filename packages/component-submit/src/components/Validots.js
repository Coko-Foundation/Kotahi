import React from 'react'
import { Field } from 'redux-form'
import { map } from 'lodash'
import Validot from './Validot'
import { connect } from 'react-redux'

// TODO: is the order of map(form.registeredFields) guaranteed to be the same?
// TODO: use journal config instead of form.registeredFields once using it to build the form
// TODO: the Field rendered here overrides the validation in the other Field with the same name

export const Validots = ({ form, valid, handleSubmit }) => (
  <div>
    {form.registeredFields &&
      map(form.registeredFields, field => (
        <div key={field.name}>
          <Field name={field.name} component={Validot} />
        </div>
      ))}

    <button onClick={handleSubmit} disabled={!valid}>
      Submit
    </button>
  </div>
)

export default connect(state => ({
  form: state.form.submit,
}))(Validots)
