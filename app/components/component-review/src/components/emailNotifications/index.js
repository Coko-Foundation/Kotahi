import React, { useState } from 'react'
import { useMutation, useQuery } from '@apollo/client'
import styled from 'styled-components'
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
import { CREATE_MESSAGE } from '../../../../../queries'
import useCurrentUser from '../../../../../hooks/useCurrentUser'
import { convertTimestampToDate } from '../../../../../shared/time-formatting'

const editorOption = user => ({
  label: user.defaultIdentity?.name || user.email || user.username,
  value: user.email,
})

const RowGridStyled = styled(SectionRowGrid)`
  grid-template-columns: repeat(5, minmax(0, 1fr));
`

const EmailNotifications = ({ manuscript }) => {
  const [selectedEmail, setSelectedEmail] = useState('')
  const [externalEmail, setExternalEmail] = useState('')
  const [externalName, setExternalName] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [isNewUser, setIsNewUser] = useState(false)

  const { data, loading, error } = useQuery(getUsers)

  const [sendEmailMutation] = useMutation(sendEmail)
  const [sendChannelMessage] = useMutation(CREATE_MESSAGE)
  const currentUser = useCurrentUser()

  if (loading || error) {
    return null
  }

  const handlerForNewUserToggle = () => {
    setIsNewUser(s => !s)
  }

  const options = (data.users || [])
    .filter(user => user.email)
    .map(user => editorOption(user))

  const logMessageAfterEmailSent = message => {
    const emailTemplateOptions = [
      {
        label: 'Author Acceptance notification',
        value: 'articleAcceptanceEmailTemplate',
      },
      {
        label: 'Evaluation Complete notification',
        value: 'evaluationCompleteEmailTemplate',
      },
    ]

    const selectedTempl = emailTemplateOptions.find(
      template => template.value === message.selectedTemplate,
    ).label

    const receiverName = message.externalEmail
      ? message.externalName
      : options.find(user => user.value === message.selectedEmail).label

    const date = Date.now()

    const body = `${convertTimestampToDate(date)} - ${selectedTempl} sent by ${
      currentUser.defaultIdentity.name
    } to ${receiverName}`

    const channelId = message.manuscript.channels.find(
      channel => channel.topic === 'Editorial discussion',
    ).id

    sendChannelMessage({
      variables: { content: body, channelId },
    })
  }

  const sendEmailHandler = async () => {
    if (!selectedTemplate || !manuscript) return

    const input = isNewUser
      ? { externalEmail, externalName, selectedTemplate, manuscript }
      : { selectedEmail, selectedTemplate, manuscript }

    if (isNewUser && (!externalName || !externalEmail)) return

    if (!isNewUser && !selectedEmail) return

    const response = await sendEmailMutation({
      variables: {
        input: JSON.stringify(input),
      },
    })

    const responseStatus = response.data.sendEmail.success

    if (responseStatus) {
      logMessageAfterEmailSent(input)
    }
  }

  return (
    <SectionContent>
      <SectionHeader>
        <Title>Notifications</Title>
      </SectionHeader>
      <RowGridStyled>
        <SelectReceiver
          externalEmail={externalEmail}
          externalName={externalName}
          isNewUser={isNewUser}
          onChangeReceiver={setSelectedEmail}
          options={options}
          selectedReceiver={selectedEmail}
          setExternalEmail={setExternalEmail}
          setExternalName={setExternalName}
          setIsNewUser={handlerForNewUserToggle}
        />
        <SelectEmailTemplate
          onChangeEmailTemplate={setSelectedTemplate}
          selectedEmailTemplate={selectedTemplate}
        />
        <StyledNotifyButton onClick={sendEmailHandler} primary>
          Notify
        </StyledNotifyButton>
      </RowGridStyled>
    </SectionContent>
  )
}

export default EmailNotifications
