import React from 'react'
import { Field, FormSection } from 'redux-form'
import Validot from './Validot'

// TODO: build sections and fields from configuration

const Validots = ({ journal, valid, handleSubmit }) => (
  <div>
    <FormSection name="metadata">
      <Field name="title" component={Validot}/>
      <Field name="abstract" component={Validot}/>
      <Field name="authors" component={Validot}/>
      <Field name="keywords" component={Validot}/>
    </FormSection>

    <FormSection name="declarations">
      {journal.declarations.questions.map(question => (
        <Field name={question.id} component={Validot}/>
      ))}
    </FormSection>

    <FormSection name="suggestions">
      <FormSection name="reviewers">
        <Field name="suggested" component={Validot}/>
        <Field name="opposed" component={Validot}/>
      </FormSection>
      <FormSection name="editors">
        <Field name="suggested" component={Validot}/>
        <Field name="opposed" component={Validot}/>
      </FormSection>
    </FormSection>

    <FormSection name="notes">
      <Field name="fundingAcknowledgement" component={Validot}/>
      <Field name="specialInstructions" component={Validot}/>
    </FormSection>

    <FormSection name="files">
      <Field name="supplementary" component={Validot}/>
    </FormSection>

    <button
      onClick={handleSubmit}
      disabled={!valid}>Submit</button>
  </div>
)

export default Validots
