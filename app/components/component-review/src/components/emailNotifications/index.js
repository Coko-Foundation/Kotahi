import React, { useState } from 'react'
import { useMutation, useQuery } from '@apollo/client'
import {
  SectionHeader,
  SectionRowGrid,
  Title,
  StyledNotifyButton,
} from '../style'
import { SectionContent } from '../../../../shared'
import SelectReceiver from './SelectReceiver'
import SelectEmailTemplate from './SelectEmailTemaplate'
import { getUsers, sendEmail } from '../queries'

const editorOption = user => ({
  label: user.defaultIdentity?.name || user.email || user.username,
  value: user.email,
})

const EmailNotifications = ({ manuscript }) => {
  const [selectedEmail, setSelectedEmail] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState('')

  const { data, loading, error } = useQuery(getUsers)

  const [sendEmailMutation] = useMutation(sendEmail)

  const sendEmailHandler = async () => {
    if (!selectedEmail || !selectedTemplate || !manuscript) return

    await sendEmailMutation({
      variables: {
        input: JSON.stringify({ selectedEmail, selectedTemplate, manuscript }),
      },
    })
  }

  if (loading || error) {
    return null
  }

  const options = (data.users || [])
    .filter(user => user.email)
    .map(user => editorOption(user))

  return (
    <SectionContent noGap>
      <SectionHeader>
        <Title>Notifications</Title>
      </SectionHeader>
      <SectionRowGrid>
        <SelectReceiver
          onChangeReceiver={setSelectedEmail}
          options={options}
          selectedReceiver={selectedEmail}
        />
        <SelectEmailTemplate
          onChangeEmailTemplate={setSelectedTemplate}
          selectedEmailTemplate={selectedTemplate}
        />
        <StyledNotifyButton onClick={sendEmailHandler} primary>
          Notify
        </StyledNotifyButton>
      </SectionRowGrid>
    </SectionContent>
  )
}

export default EmailNotifications
