import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, gql } from '@apollo/client'
import { cloneDeep, omitBy } from 'lodash'
import { DragDropContext, Droppable } from 'react-beautiful-dnd'
import FormBuilderLayout from './FormBuilderLayout'
import { Spinner, CommsErrorBanner } from '../../../shared'
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
          includeInReviewerPreview
          inline
          sectioncss
          parse
          format
          options {
            id
            label
            labelColor
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
          hideFromAuthors
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
  const cleanedForms = pruneEmpty(data?.forms)

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
  const [formFeilds, setFormFeilds] = useState(cleanedForms)

  useEffect(() => {
    setFormFeilds(cleanedForms)
  }, [data?.forms])

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

  const dragField = form => {
    const forms = pruneEmpty(data.forms)[0]

    const fields = forms.structure.children

    const fromIndex = form.source.index

    const toIndex = form.destination.index

    const draggedField = fields[fromIndex]
    const newFields = [...fields]
    newFields.splice(fromIndex, 1)
    newFields.splice(toIndex, 0, draggedField)
    setFormFeilds([
      { ...forms, structure: { ...forms.structure, children: newFields } },
    ])

    updateForm({
      variables: {
        form: prepareForSubmit({
          ...forms,
          structure: { ...forms.structure, children: newFields },
        }),
      },
      optimisticResponse: {
        __typename: 'Mutation',
        updateForm: {
          id: forms.id,
          __typename: 'FormStructure',
          structure: { ...forms.structure, children: newFields },
        },
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
  if (error) return <CommsErrorBanner error={error} />

  return (
    <div style={{ overflowY: 'scroll', height: '100vh' }}>
      <DragDropContext onDragEnd={dragField}>
        <Droppable droppableId="droppable">
          {(provided, snapshot) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              <FormBuilderLayout
                activeFieldId={activeFieldId}
                activeFormId={activeFormId}
                createForm={createForm}
                deleteField={deleteFormElement}
                deleteForm={deleteForm}
                forms={formFeilds}
                moveFieldDown={moveFieldDown}
                moveFieldUp={moveFieldUp}
                setActiveFieldId={setActiveFieldId}
                setActiveFormId={setActiveFormId}
                updateField={updateFormElement}
                updateForm={updateForm}
              />
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  )
}

export default FormBuilderPage
