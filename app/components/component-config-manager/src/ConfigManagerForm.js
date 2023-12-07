/* eslint-disable no-unused-vars */
import React, { useState } from 'react'
/* eslint-disable import/no-unresolved */
import Form from '@rjsf/core'
import { useTranslation } from 'react-i18next'
import generateSchema from './ui/schema' // Import the function that generates the schema and uiSchema

import {
  ActionButton,
  Container,
  HeadingWithAction,
  Heading,
  PaddedContent,
  SectionContent,
  WidthLimiter,
} from '../../shared'

const FieldTemplate = props => {
  const { classNames, description, children } = props
  return (
    <div className={classNames}>
      {description}
      {children}
    </div>
  )
}

const ConfigManagerForm = ({
  configId,
  disabled,
  formData,
  deleteFile,
  createFile,
  config,
  liveValidate = true,
  omitExtraData = true,
  updateConfig,
  updateConfigStatus,
  emailTemplates,
}) => {
  const { t } = useTranslation()

  const [logoId, setLogoId] = useState(null)

  const emailNotificationOptions = emailTemplates.map(template => {
    const emailOption = {
      const: template.id,
      title: template.emailContent.description,
    }

    return emailOption
  })

  // This will return first email template found of reviewer invitation type
  const defaultReviewerInvitationEmail = emailTemplates.find(
    emailTemplate => emailTemplate.emailTemplateType === 'reviewerInvitation',
  )

  // modifying the default reviewer invitation template into react json schema form structure
  const defaultReviewerInvitationTemplate = {
    const: defaultReviewerInvitationEmail.id,
    title: defaultReviewerInvitationEmail.emailContent.description,
  }

  const { schema, uiSchema } = generateSchema(
    emailNotificationOptions,
    setLogoId,
    deleteFile,
    createFile,
    config,
    defaultReviewerInvitationTemplate,
    t,
  )

  const updateConfigData = formDataToUpdate => {
    const updatedFormData = formDataToUpdate
    updatedFormData.groupIdentity.logoId = logoId
    updateConfig(configId, updatedFormData)
  }

  return (
    <>
      <link
        crossOrigin="anonymous"
        href="https://cdn.jsdelivr.net/npm/bootstrap@3.4.1/dist/css/bootstrap.min.css"
        integrity="sha384-HSMxcRTRxnN+Bdg0JdbxYKrThecOKuH5zCYotlSAcp1+c8xmyTe9GYg1l9a69psu"
        rel="stylesheet"
      />
      <Container>
        <HeadingWithAction>
          <Heading>{t('configPage.Configuration')}</Heading>
        </HeadingWithAction>
        <WidthLimiter>
          <SectionContent>
            <PaddedContent>
              <Form
                disabled={disabled}
                FieldTemplate={FieldTemplate}
                formData={formData}
                liveValidate={liveValidate}
                noHtml5Validate
                omitExtraData={omitExtraData}
                onSubmit={values => updateConfigData(values.formData)}
                schema={schema}
                uiSchema={uiSchema}
              >
                <ActionButton
                  disabled={disabled}
                  primary
                  status={updateConfigStatus}
                  type="submit"
                >
                  {t('configPage.Submit')}
                </ActionButton>
              </Form>
            </PaddedContent>
          </SectionContent>
        </WidthLimiter>
      </Container>
    </>
  )
}

export default ConfigManagerForm
