import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, gql } from '@apollo/client'
import FormBuilderLayout from './FormBuilderLayout'
import { Spinner } from '../../../shared'

const createFormMutation = gql`
  mutation($form: String!) {
    createForm(form: $form)
  }
`

const updateFormMutation = gql`
  mutation($form: String!, $formId: String!) {
    updateForm(form: $form, formId: $formId)
  }
`

const updateFormElementMutation = gql`
  mutation($element: String!, $formId: String!) {
    updateFormElement(element: $element, formId: $formId)
  }
`

const deleteFormElementMutation = gql`
  mutation($formId: ID!, $elementId: ID!) {
    deleteFormElement(formId: $formId, elementId: $elementId)
  }
`

const deleteFormMutation = gql`
  mutation($formId: ID!) {
    deleteForms(formId: $formId)
  }
`

const query = gql`
  query {
    currentUser {
      id
      username
      admin
    }

    getForms
  }
`

const FormBuilderPage = props => {
  const { loading, data, error } = useQuery(query)

  const [deleteForm] = useMutation(deleteFormMutation)
  const [deleteFormElement] = useMutation(deleteFormElementMutation)

  const [updateForm] = useMutation(updateFormMutation)
  const [updateFormElement] = useMutation(updateFormElementMutation)
  const [createForm] = useMutation(createFormMutation)

  const [properties, setProperties] = useState({ type: 'form', properties: {} })
  const [activeTab, setActiveTab] = useState()

  useEffect(() => {
    if (!loading && data) {
      if (data.getForms.length) {
        setActiveTab(0)
        setProperties({ type: 'form', properties: data.getForms[0] })
      } else {
        setActiveTab('new')
      }
    }
  }, [loading, data])

  if (loading || activeTab === undefined) return <Spinner />
  if (error) return JSON.stringify(error)

  return (
    <FormBuilderLayout
      activeTab={activeTab}
      createForm={createForm}
      deleteForm={deleteForm}
      deleteFormElement={deleteFormElement}
      getForms={data.getForms}
      properties={properties}
      setActiveTab={setActiveTab}
      setProperties={setProperties}
      updateForm={updateForm}
      updateFormElement={updateFormElement}
    />
  )
}

export default FormBuilderPage
