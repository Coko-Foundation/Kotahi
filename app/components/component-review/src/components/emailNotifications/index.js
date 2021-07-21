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

  if (loading || error) {
    return null
  }

  const sendEmailHandler = async () => {
    if (!selectedTemplate || !manuscript) return

    const input = isNewUser
      ? { externalEmail, externalName, selectedTemplate, manuscript }
      : { selectedEmail, selectedTemplate, manuscript }

    if (isNewUser && (!externalName || !externalEmail)) return

    if (!isNewUser && !selectedEmail) return

    await sendEmailMutation({
      variables: {
        input: JSON.stringify(input),
      },
    })
  }

  const handlerForNewUserToggle = () => {
    setIsNewUser(s => !s)
  }

  const options = (data.users || [])
    .filter(user => user.email)
    .map(user => editorOption(user))

  return (
    <SectionContent noGap>
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
