import React from 'react'
import { useQuery, useMutation, gql } from '@apollo/client'
import { GET_EMAIL_TEMPLATES } from '../../../queries'
import { CommsErrorBanner, Spinner } from '../../shared'
import EmailTemplates from './EmailTemplates'
import { ConfigContext } from '../../config/src'
import GET_VARIABLES from './handlebarsAutocomplete/graphql/graphql'
import { handlebars } from './handlebarsAutocomplete/constants'

const deleteEmailTemplateMutation = gql`
  mutation deleteEmailTemplate($id: ID!) {
    deleteEmailTemplate(id: $id) {
      success
      error
    }
  }
`

const commonEmailTemplateFields = `
  emailTemplate {
    id
    emailContent {
      cc
      subject
      body
      description
      ccEditors
    }
    emailTemplateType
    groupId
  }
  success
  error
`

export const createEmailTemplateMutation = gql`
  mutation createEmailTemplate($input: EmailTemplateInput!) {
    createEmailTemplate(input: $input) {
      ${commonEmailTemplateFields}
    }
  }
`

export const updateEmailTemplateMutation = gql`
  mutation updateEmailTemplate($input: EmailTemplateInput!) {
    updateEmailTemplate(input: $input) {
      ${commonEmailTemplateFields}
    }
  }
`

const EmailTemplatesPage = ({ match, history, ...props }) => {
  const config = React.useContext(ConfigContext)
  const { urlFrag, groupId } = config

  const {
    loading,
    error,
    data,
    refetch: refetchEmailTemplate,
  } = useQuery(GET_EMAIL_TEMPLATES)

  useQuery(GET_VARIABLES, {
    variables: { groupId },
    onCompleted: ({ getVariables: variables = [] }) => {
      handlebars.store({ variables })
    },
  })

  const [deleteEmailTemplate] = useMutation(deleteEmailTemplateMutation)
  const [createEmailTemplate] = useMutation(createEmailTemplateMutation)

  const [updateEmailTemplate] = useMutation(updateEmailTemplateMutation, {
    onCompleted: refetchEmailTemplate,
  })

  const [isNewEmailTemplate, setIsNewEmailTemplate] = React.useState(false)

  let currentEmailTemplateId = null

  if (match.params.pageId) {
    currentEmailTemplateId = match.params.pageId
  }

  const showEmailTemplate = async currrentEmailTemplate => {
    setIsNewEmailTemplate(false)
    await refetchEmailTemplate()
    const link = `${urlFrag}/admin/email-templates/${currrentEmailTemplate.id}`
    history.push(link)
  }

  const addNewPage = () => {
    if (isNewEmailTemplate) {
      return
    }

    setIsNewEmailTemplate(true)
  }

  if (loading && !data) return <Spinner />
  if (error) return <CommsErrorBanner error={error} />

  const { emailTemplates } = data

  let emailTemplate = emailTemplates?.length > 0 ? emailTemplates[0] : null

  if (currentEmailTemplateId) {
    emailTemplate = emailTemplates.find(obj => {
      return obj.id === currentEmailTemplateId
    })
  }

  if (isNewEmailTemplate) {
    emailTemplate = {}
  }

  return (
    <EmailTemplates
      activeTemplate={emailTemplate}
      createEmailTemplate={createEmailTemplate}
      deleteEmailTemplate={deleteEmailTemplate}
      emailTemplates={emailTemplates}
      isNewEmailTemplate={isNewEmailTemplate}
      onItemClick={selectedCmsPage => showEmailTemplate(selectedCmsPage)}
      onNewItemButtonClick={() => addNewPage()}
      setIsNewEmailTemplate={setIsNewEmailTemplate}
      showEmailTemplate={showEmailTemplate}
      updateEmailTemplate={updateEmailTemplate}
    />
  )
}

export default EmailTemplatesPage
