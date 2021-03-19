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
    getForms
  }
`

const FormBuilderPage = () => {
  const { loading, data, error } = useQuery(query)

  // TODO Structure forms for graphql and retrieve IDs from these mutations to allow Apollo Cache to do its magic, rather than forcing refetch.
  const [deleteForm] = useMutation(deleteFormMutation, {
    refetchQueries: [{ query }],
  })

  const [deleteFormElement] = useMutation(deleteFormElementMutation, {
    refetchQueries: [{ query }],
  })

  const [updateForm] = useMutation(updateFormMutation, {
    refetchQueries: [{ query }],
  })

  const [updateFormElement] = useMutation(updateFormElementMutation, {
    refetchQueries: [{ query }],
  })

  const [createForm] = useMutation(createFormMutation, {
    refetchQueries: [{ query }],
  })

  const [activeFormId, setActiveFormId] = useState()
  const [activeFieldId, setActiveFieldId] = useState()

  useEffect(() => {
    if (!loading && data) {
      if (data.getForms.length) {
        setActiveFormId(prevFormId => prevFormId ?? data.getForms[0].id)
      } else {
        setActiveFormId('new')
      }
    }
  }, [loading, data])

  if (loading || !activeFormId) return <Spinner />
  if (error) return JSON.stringify(error)

  return (
    <FormBuilderLayout
      activeFieldId={activeFieldId}
      activeFormId={activeFormId}
      createForm={createForm}
      deleteForm={deleteForm}
      deleteFormElement={deleteFormElement}
      forms={data.getForms}
      setActiveFieldId={setActiveFieldId}
      setActiveFormId={setActiveFormId}
      updateForm={updateForm}
      updateFormElement={updateFormElement}
    />
  )
}

export default FormBuilderPage
