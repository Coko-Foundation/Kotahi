import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, gql } from '@apollo/client'
import { cloneDeep, omitBy } from 'lodash'
import FormBuilderLayout from './FormBuilderLayout'
import { Spinner } from '../../../shared'
import pruneEmpty from '../../../../shared/pruneEmpty'

const createFormMutation = gql`
  mutation($form: CreateFormInput!) {
    createForm(form: $form) {
      id
    }
  }
`

const updateFormMutation = gql`
  mutation($form: FormInput!) {
    updateForm(form: $form) {
      id
    }
  }
`

const updateFormElementMutation = gql`
  mutation($element: FormElementInput!, $formId: String!) {
    updateFormElement(element: $element, formId: $formId) {
      id
    }
  }
`

const deleteFormElementMutation = gql`
  mutation($formId: ID!, $elementId: ID!) {
    deleteFormElement(formId: $formId, elementId: $elementId) {
      id
    }
  }
`

const deleteFormMutation = gql`
  mutation($formId: ID!) {
    deleteForm(formId: $formId) {
      query {
        forms {
          id
        }
      }
    }
  }
`

const query = gql`
  query {
    forms {
      id
      created
      updated
      purpose
      structure {
        name
        description
        haspopup
        popuptitle
        popupdescription
        children {
          title
          shortDescription
          id
          component
          name
          description
          doiValidation
          placeholder
          inline
          sectioncss
          parse
          format
          options {
            id
            label
            value
          }
          validate {
            id
            label
            value
          }
          validateValue {
            minChars
            maxChars
            minSize
          }
        }
      }
    }
  }
`

const prepareForSubmit = values => {
  const cleanedValues = omitBy(cloneDeep(values), value => value === '')
  return cleanedValues
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
    const fields = form.structure.children
    const currentIndex = fields.findIndex(field => field.id === fieldId)
    if (currentIndex < 1) return

    const fieldsToSwapA = fields[currentIndex - 1]
    const fieldsToSwapB = fields[currentIndex]
    const newFields = [...fields]
    newFields.splice(currentIndex - 1, 2, fieldsToSwapB, fieldsToSwapA)

    updateForm({
      variables: {
        form: prepareForSubmit({
          ...form,
          structure: { ...form.structure, children: newFields },
        }),
      },
    })
  }

  const moveFieldDown = (form, fieldId) => {
    const fields = form.structure.children
    const currentIndex = fields.findIndex(field => field.id === fieldId)
    if (currentIndex < 0 || currentIndex >= fields.length - 1) return

    const fieldsToSwapA = fields[currentIndex]
    const fieldsToSwapB = fields[currentIndex + 1]
    const newFields = [...fields]
    newFields.splice(currentIndex, 2, fieldsToSwapB, fieldsToSwapA)

    updateForm({
      variables: {
        form: prepareForSubmit({
          ...form,
          structure: { ...form.structure, children: newFields },
        }),
      },
    })
  }

  useEffect(() => {
    if (!loading && data) {
      if (data.forms.length) {
        setActiveFormId(prevFormId => prevFormId ?? data.forms[0].id)
      } else {
        setActiveFormId('new')
      }
    }
  }, [loading, data])

  if (loading || !activeFormId) return <Spinner />
  if (error) return JSON.stringify(error)

  const cleanedForms = pruneEmpty(data.forms)

  return (
    <FormBuilderLayout
      activeFieldId={activeFieldId}
      activeFormId={activeFormId}
      createForm={createForm}
      deleteField={deleteFormElement}
      deleteForm={deleteForm}
      forms={cleanedForms}
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
