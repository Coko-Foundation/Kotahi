import React from 'react'
import { Select } from '../../../../shared'

const emailTemplateOptions = [
  {
    label: 'Author Acceptance required notification template',
    value: 'articleAcceptanceEmailTemplate',
  },
  {
    label: 'Evaluation Complete required notification template',
    value: 'evaluationCompleteEmailTemplate',
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
