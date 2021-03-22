import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, gql } from '@apollo/client'
import { omitBy } from 'lodash'
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

const prepareForSubmit = values => {
  const cleanedValues = omitBy(values, value => value === '')
  return JSON.stringify(cleanedValues)
}

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

  const moveFieldUp = (form, fieldId) => {
    const currentIndex = form.children.findIndex(field => field.id === fieldId)
    if (currentIndex < 1) return

    const fieldsToSwapA = form.children[currentIndex - 1]
    const fieldsToSwapB = form.children[currentIndex]
    const newFields = [...form.children]
    newFields.splice(currentIndex - 1, 2, fieldsToSwapB, fieldsToSwapA)

    updateForm({
      variables: {
        formId: form.id,
        form: prepareForSubmit({ ...form, children: newFields }),
      },
    })
  }

  const moveFieldDown = (form, fieldId) => {
    const currentIndex = form.children.findIndex(field => field.id === fieldId)
    if (currentIndex < 0 || currentIndex >= form.children.length - 1) return

    const fieldsToSwapA = form.children[currentIndex]
    const fieldsToSwapB = form.children[currentIndex + 1]
    const newFields = [...form.children]
    newFields.splice(currentIndex, 2, fieldsToSwapB, fieldsToSwapA)

    updateForm({
      variables: {
        formId: form.id,
        form: prepareForSubmit({ ...form, children: newFields }),
      },
    })
  }

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
      deleteField={deleteFormElement}
      deleteForm={deleteForm}
      forms={data.getForms}
      moveFieldDown={moveFieldDown}
      moveFieldUp={moveFieldUp}
      setActiveFieldId={setActiveFieldId}
      setActiveFormId={setActiveFormId}
      updateField={updateFormElement}
      updateForm={updateForm}
    />
  )
}

export default FormBuilderPage
