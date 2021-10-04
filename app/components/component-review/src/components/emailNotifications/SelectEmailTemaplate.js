import React from 'react'
import { Select } from '../../../../shared'

const emailTemplateOptions =
  process.env.INSTANCE_NAME === 'colab'
    ? [
        {
          label: 'Author Acceptance required notification template',
          value: 'articleAcceptanceEmailTemplate',
        },
        {
          label: 'Evaluation Complete required notification template',
          value: 'evaluationCompleteEmailTemplate',
        },
      ]
    : [
        {
          label: 'Evaluation Complete required notification template',
          value: 'evaluationCompleteEmailTemplate',
        },
        {
          label: 'Editor Assignment notification template',
          value: 'editorAssignmentEmailTemplate',
        },
        {
          label: 'Review Invitation notification template',
          value: 'reviewInvitationEmailTemplate',
        },
        {
          label: 'Submission Confirmation notification template',
          value: 'submissionConfirmationEmailTemplate',
        },
        {
          label: 'Message notification template',
          value: 'messageNotificationEmailTemplate',
        },
      ]

const SelectEmailTemplate = ({
  onChangeEmailTemplate,
  selectedEmailTemplate,
}) => {
  return (
    <Select
      aria-label="Notification_email_select"
      data-testid="Notification_email_select"
      label="notification email"
      onChange={selected => {
        onChangeEmailTemplate(selected.value)
      }}
      options={emailTemplateOptions}
      placeholder="Choose notification template"
      value={selectedEmailTemplate}
    />
  )
}

export default SelectEmailTemplate
