import React, { useState, useEffect } from 'react'
// import { compose, withState, withHandlers, withProps } from 'recompose'
import { useQuery, useMutation, gql } from '@apollo/client'
// import gql from 'graphql-tag'
// import { withLoader } from 'pubsweet-client'

import FormBuilderLayout from './FormBuilderLayout'
import { Spinner } from '../../../shared'

const createFormMutation = gql`
  mutation($form: String!) {
    createForm(form: $form)
  }
`

const updateFormMutation = gql`
  mutation($form: String!, $id: String!) {
    updateForm(form: $form, id: $id)
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

// export default compose(
// graphql(query),
// graphql(deleteForms, {
//   name: 'deleteForms',
// }),
// graphql(deleteFormElement, {
//   name: 'deleteFormElement',
// }),
// graphql(updateForm, {
//   name: 'updateForm',
// }),
// graphql(createForm, {
//   name: 'createForm',
// }),
// graphql(updateFormElements, {
//   name: 'updateFormElements',
// }),
// withLoader(),
// withProps(props => ({
//   deleteForm: formId =>
//     props.deleteForms({
//       variables: {
//         formId,
//       },
//     }),
//   deleteElement: (formId, elementId) =>
//     props.deleteFormElement({
//       variables: {
//         formId,
//         elementId,
//       },
//     }),
//   updateForm: (form, formProperties) =>
//     props.updateForm({
//       variables: {
//         form: JSON.stringify(formProperties),
//         id: form.id,
//       },
//     }),
//   createForm: formProperties =>
//     props.createForm({
//       variables: {
//         form: JSON.stringify(formProperties),
//       },
//     }),
//   updateElements: (form, formElements) =>
//     props.updateFormElements({
//       variables: {
//         form: JSON.stringify(formElements),
//         formId: form.id,
//       },
//     }),
// })),
// withState('properties', 'onChangeProperties', ({ getForms }) => ({
//   type: 'form',
//   properties: getForms[0] || {},
// })),
// withState('activeTab', 'onChangeTab', ({ getForms, activeTab }) =>
//   getForms.length === 0 ? 'new' : 0,
// ),
//   withHandlers({
//     changeProperties: ({
//       onChangeProperties,
//       getForms,
//       activeTab,
//     }) => properties =>
//       onChangeProperties(
//         () =>
//           Object.assign({}, properties, {
//             id: (getForms[activeTab] || {}).id,
//           }) || undefined,
//       ),
//     changeTabs: ({ onChangeTab }) => activeTab => {
//       onChangeTab(() => activeTab || '')
//     },
//   }),
// )(FormBuilderLayout)
