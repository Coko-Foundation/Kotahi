import React, { useState, useEffect, useContext } from 'react'
import { useQuery, useMutation, gql } from '@apollo/client'
import { cloneDeep, omitBy } from 'lodash'
import { DragDropContext, Droppable } from 'react-beautiful-dnd'
import { ConfigContext } from '../../../config/src'
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
  query GET_FORM($category: String!, $groupId: ID) {
    formsByCategory(category: $category, groupId: $groupId) {
      id
      created
      updated
      purpose
      category
      groupId
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
          doiUniqueSuffixValidation
          placeholder
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
          hideFromReviewers
          hideFromAuthors
          permitPublishing
          publishingTag
        }
      }
    }
  }
`

const prepareForSubmit = values => {
  const cleanedValues = omitBy(cloneDeep(values), value => value === '')
  return cleanedValues
}

const FormBuilderPage = ({ category }) => {
  const config = useContext(ConfigContext)

  const { loading, data, error } = useQuery(query, {
    variables: { category, groupId: config.groupId },
  })

  const cleanedForms = pruneEmpty(data?.formsByCategory)

  // TODO Structure forms for graphql and retrieve IDs from these mutations to allow Apollo Cache to do its magic, rather than forcing refetch.
  const [deleteForm] = useMutation(deleteFormMutation, {
    refetchQueries: [
      { query, variables: { category, groupId: config.groupId } },
    ],
  })

  const [deleteFormElement] = useMutation(deleteFormElementMutation, {
    refetchQueries: [
      { query, variables: { category, groupId: config.groupId } },
    ],
  })

  const [updateForm] = useMutation(updateFormMutation, {
    refetchQueries: [
      { query, variables: { category, groupId: config.groupId } },
    ],
  })

  const [updateFormElement] = useMutation(updateFormElementMutation, {
    refetchQueries: [
      { query, variables: { category, groupId: config.groupId } },
    ],
  })

  const [createForm] = useMutation(createFormMutation, {
    refetchQueries: [
      { query, variables: { category, groupId: config.groupId } },
    ],
  })

  const [activeFormId, setActiveFormId] = useState()
  const [activeFieldId, setActiveFieldId] = useState()
  const [formFeilds, setFormFeilds] = useState(cleanedForms)

  useEffect(() => {
    setFormFeilds(cleanedForms)
  }, [data?.formsByCategory])

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
    const forms = pruneEmpty(data.formsByCategory)

    const activeForm = forms?.filter(
      formData => formData.id === activeFormId,
    )[0]

    const fields = activeForm.structure.children

    const fromIndex = form.source.index

    const toIndex = form.destination.index

    const draggedField = fields[fromIndex]
    const newFields = [...fields]
    newFields.splice(fromIndex, 1)
    newFields.splice(toIndex, 0, draggedField)

    const updatedForm = {
      ...activeForm,
      structure: { ...activeForm.structure, children: newFields },
    }

    const updatedForms = forms.map(formData =>
      formData.id === activeForm.id ? updatedForm : formData,
    )

    setFormFeilds(updatedForms)

    updateForm({
      variables: {
        form: prepareForSubmit(updatedForm),
      },
      optimisticResponse: {
        __typename: 'Mutation',
        updateForm: {
          id: forms.id,
          __typename: 'FormStructure',
          structure: { ...activeForm.structure, children: newFields },
        },
      },
    })
  }

  useEffect(() => {
    if (!loading && data) {
      if (data.formsByCategory.length) {
        setActiveFormId(prevFormId => prevFormId ?? data.formsByCategory[0].id)
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
                category={category}
                createForm={createForm}
                deleteField={deleteFormElement}
                deleteForm={deleteForm}
                forms={formFeilds}
                moveFieldDown={moveFieldDown}
                moveFieldUp={moveFieldUp}
                setActiveFieldId={setActiveFieldId}
                setActiveFormId={setActiveFormId}
                shouldAllowHypothesisTagging={
                  config?.publishing?.hypothesis?.shouldAllowTagging
                }
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
