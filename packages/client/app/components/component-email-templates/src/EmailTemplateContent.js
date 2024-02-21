import React, { useState } from 'react'
import { Formik } from 'formik'
// eslint-disable-next-line import/no-unresolved
import { useTranslation } from 'react-i18next'
import { FullWidthAndHeightContainer } from '../../component-cms-manager/src/style'
import EmailTemplateEditForm from './EmailTemplateEditForm'

const EmailTemplateContent = ({
  activeTemplate,
  emailTemplates,
  isNewEmailTemplate,
  showEmailTemplate,
  updateEmailTemplate,
  createEmailTemplate,
  deleteEmailTemplate,
}) => {
  const { t } = useTranslation()
  const [submitButtonStatus, setSubmitButtonStatus] = useState(null)

  const emailValidationRegexp =
    /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/i

  const validateEmailList = cc => {
    const emailList = cc.split(',').map(email => email.trim())

    const invalidEmails = emailList.filter(
      email => !emailValidationRegexp.test(email),
    )

    if (invalidEmails.length > 0) {
      return t('emailTemplate.validationMessages.invalidEmail')
    }

    return null
  }

  const autoSaveData = async (id, data) => {
    if (isNewEmailTemplate) {
      return
    }

    const inputData = { ...data }
    await updateEmailTemplate({
      variables: { id, input: inputData },
    })
  }

  const handleUpdate = async formData => {
    setSubmitButtonStatus('pending')

    const inputData = {
      id: activeTemplate.id,
      emailContent: {
        subject: formData?.subject,
        cc: formData?.cc,
        body: formData?.body,
        description: formData?.description,
        ccEditors: formData?.ccEditors,
      },
    }

    await updateEmailTemplate({
      variables: {
        input: inputData,
      },
    })

    setSubmitButtonStatus('success')
  }

  const createNewTemplate = async formData => {
    const inputData = {
      emailContent: {
        subject: formData?.subject,
        cc: formData?.cc,
        body: formData?.body,
        description: formData?.description,
        ccEditors: formData?.ccEditors,
      },
    }

    const newEmailTemplateResults = await createEmailTemplate({
      variables: {
        input: inputData,
      },
    })

    const newEmailTemplate = newEmailTemplateResults?.data?.createEmailTemplate

    if (newEmailTemplate.success) {
      showEmailTemplate(newEmailTemplate?.emailTemplate)
    }
  }

  const onDelete = async currentEmailTemplate => {
    try {
      await deleteEmailTemplate({
        variables: { id: currentEmailTemplate.id },
      })

      // eslint-disable-next-line no-console
      console.log('Email template deleted successfully.')
    } catch (error) {
      console.error('Error deleting email template:', error)
    }

    showEmailTemplate({ id: '' })
  }

  return (
    <FullWidthAndHeightContainer>
      <Formik
        enableReinitialize
        initialValues={{
          description: activeTemplate?.emailContent?.description || '',
          body: activeTemplate?.emailContent?.body || '',
          cc: activeTemplate?.emailContent?.cc || '',
          subject: activeTemplate?.emailContent?.subject || '',
          ccEditors: activeTemplate?.emailContent?.ccEditors || false,
        }}
        onSubmit={async values =>
          isNewEmailTemplate ? createNewTemplate(values) : handleUpdate(values)
        }
        validate={values => {
          const errors = {}

          const isDescriptionUpdated =
            values.description !== activeTemplate?.emailContent?.description

          if (isDescriptionUpdated && values.description) {
            // Check if a template with the same description already exists
            const existingTemplate = emailTemplates.find(
              template =>
                template.emailContent.description === values.description,
            )

            if (existingTemplate) {
              errors.description = t(
                'emailTemplate.validationMessages.duplicateDescription',
              )
            }
          }

          if (values.cc) {
            const ccError = validateEmailList(values.cc)

            if (ccError) {
              errors.cc = ccError
            }
          }

          return errors
        }}
      >
        {formikProps => {
          return (
            <EmailTemplateEditForm
              activeTemplate={activeTemplate}
              autoSaveData={autoSaveData}
              currentValues={formikProps.values}
              isNewEmailTemplate={isNewEmailTemplate}
              onDelete={onDelete}
              onSubmit={formikProps.handleSubmit}
              setFieldValue={formikProps.setFieldValue}
              setTouched={formikProps.setTouched}
              submitButtonStatus={submitButtonStatus}
            />
          )
        }}
      </Formik>
    </FullWidthAndHeightContainer>
  )
}

export default EmailTemplateContent
