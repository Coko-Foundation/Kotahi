import React, { useState } from 'react'
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
import { convertTimestampToDate } from '../../../../../shared/time-formatting'

const editorOption = user => ({
  label: user.username || user.email,
  value: user.email,
})

const RowGridStyled = styled(SectionRowGrid)`
  grid-template-columns: repeat(5, minmax(0, 1fr));
`

const EmailNotifications = ({
  manuscript,
  allUsers,
  currentUser,
  sendNotifyEmail,
  sendChannelMessageCb,
}) => {
  const [selectedEmail, setSelectedEmail] = useState('')
  const [externalEmail, setExternalEmail] = useState('')
  const [externalName, setExternalName] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [isNewUser, setIsNewUser] = useState(false)

  const handlerForNewUserToggle = () => {
    setIsNewUser(s => !s)
  }

  const options = (allUsers || [])
    .filter(user => user.email)
    .map(user => editorOption(user))

  const logMessageAfterEmailSent = async message => {
    const emailTemplateOptions = [
      {
        label: 'Author Acceptance notification',
        value: 'articleAcceptanceEmailTemplate',
      },
      {
        label: 'Evaluation Complete notification',
        value: 'evaluationCompleteEmailTemplate',
      },
      {
        label: 'Editor Assignment notification',
        value: 'editorAssignmentEmailTemplate',
      },
      {
        label: 'Review Invitation notification',
        value: 'reviewInvitationEmailTemplate',
      },
      {
        label: 'Submission Confirmation notification',
        value: 'submissionConfirmationEmailTemplate',
      },
      {
        label: 'Message notification',
        value: 'messageNotificationEmailTemplate',
      },
      {
        label: 'Review Reject',
        value: 'reviewRejectEmailTemplate',
      },
      {
        label: 'Review Assignment',
        value: 'reviewAssignmentEmailTemplate',
      },
      {
        label: 'Review Complete',
        value: 'reviewCompleteEmailTemplate',
      },
      {
        label: 'Message',
        value: 'messageNotificationEmailTemplate',
      },
      {
        label: 'Tonya White - Handling Editor Assignment',
        value: 'editorAssignmentEmailTemplate',
      },
      {
        label: 'Adhoc EIC - Handling Editor Assignment',
        value: 'adhocEditorAssignmentEmailTemplate',
      },
      {
        label: 'Mallar Chakravarty - Handling Editor Assignment',
        value: 'deputyEditorAssignmentEmailTemplate',
      },
      {
        label: 'Uzay Emir - Peer-Review Invitation Assignment',
        value: 'reviewInvitationEmailTemplate1',
      },
      {
        label: 'Catie Chang - Peer-Review Invitation Assignment',
        value: 'reviewInvitationEmailTemplate2',
      },
      {
        label: 'Satrajit Ghosh - Peer-Review Invitation Assignment',
        value: 'reviewInvitationEmailTemplate3',
      },
      {
        label: 'Adam Thomas - Peer-Review Invitation Assignment',
        value: 'reviewInvitationEmailTemplate4',
      },
      {
        label: 'Vincent Clark - Peer-Review Invitation Assignment',
        value: 'reviewInvitationEmailTemplate5',
      },
      {
        label: 'Lucina Uddin - Peer-Review Invitation Assignment',
        value: 'reviewInvitationEmailTemplate6',
      },
      {
        label: 'Pierre Bellec - Peer-Review Invitation Assignment',
        value: 'reviewInvitationEmailTemplate7',
      },
      {
        label: 'Hiromasa Takemura - Peer-Review Invitation Assignment',
        value: 'reviewInvitationEmailTemplate8',
      },
      {
        label: 'Molly Bright - Peer-Review Invitation Assignment',
        value: 'reviewInvitationEmailTemplate9',
      },
      {
        label: 'Tianzi Jiang - Peer-Review Invitation Assignment',
        value: 'reviewInvitationEmailTemplate10',
      },
      {
        label: 'Jing Xiang - Peer-Review Invitation Assignment',
        value: 'reviewInvitationEmailTemplate11',
      },
      {
        label: 'Won Mok Shim - Peer-Review Invitation Assignment',
        value: 'reviewInvitationEmailTemplate12',
      },
      {
        label: 'Athina Tzovara - Peer-Review Invitation Assignment',
        value: 'reviewInvitationEmailTemplate13',
      },
      {
        label: 'Philip Shaw - Peer-Review Invitation Assignment',
        value: 'reviewInvitationEmailTemplate14',
      },
      {
        label: 'Mallar Chakravarty - Peer-Review Invitation Assignment',
        value: 'reviewInvitationEmailTemplate15',
      },
      {
        label: 'Anqi Qiu - Peer-Review Invitation Assignment',
        value: 'reviewInvitationEmailTemplate16',
      },
      {
        label: 'Armin Raznahan - Peer-Review Invitation Assignment',
        value: 'reviewInvitationEmailTemplate17',
      },
      {
        label: 'Mitchell Valdes Sosa - Peer-Review Invitation Assignment',
        value: 'reviewInvitationEmailTemplate18',
      },
      {
        label: 'Jorge Moll - Peer-Review Invitation Assignment',
        value: 'reviewInvitationEmailTemplate19',
      },
      {
        label: 'Jean Chen - Peer-Review Invitation Assignment',
        value: 'reviewInvitationEmailTemplate20',
      },
      {
        label: 'Angela Laird - Peer-Review Invitation Assignment',
        value: 'reviewInvitationEmailTemplate21',
      },
      {
        label: 'Valeria Della-Maggiore - Peer-Review Invitation Assignment',
        value: 'reviewInvitationEmailTemplate22',
      },
      {
        label: 'Meredith Reid - Peer-Review Invitation Assignment',
        value: 'reviewInvitationEmailTemplate23',
      },
      {
        label: 'Archana Venkataraman - Peer-Review Invitation Assignment',
        value: 'reviewInvitationEmailTemplate24',
      },
      {
        label: 'Michele Veldsman - Peer-Review Invitation Assignment',
        value: 'reviewInvitationEmailTemplate25',
      },
      {
        label: 'Sharlene Newman - Peer-Review Invitation Assignment',
        value: 'reviewInvitationEmailTemplate26',
      },
      {
        label: 'Memba Jabbi - Peer-Review Invitation Assignment',
        value: 'reviewInvitationEmailTemplate27',
      },
      {
        label: 'Edson Amaro - Peer-Review Invitation Assignment',
        value: 'reviewInvitationEmailTemplate28',
      },
      {
        label: 'Kendrick Kay - Peer-Review Invitation Assignment',
        value: 'reviewInvitationEmailTemplate30',
      },
      {
        label: 'Alexandre Gramfort - Peer-Review Invitation Assignment',
        value: 'reviewInvitationEmailTemplate31',
      },
      {
        label: 'Renzo Huber - Peer-Review Invitation Assignment',
        value: 'reviewInvitationEmailTemplate32',
      },
      {
        label: 'Cyril Pernet - Peer-Review Invitation Assignment',
        value: 'reviewInvitationEmailTemplate33',
      },
      {
        label: 'Bertrand Thirion - Peer-Review Invitation Assignment',
        value: 'reviewInvitationEmailTemplate34',
      },
      {
        label: 'Daniel Margulies - Peer-Review Invitation Assignment',
        value: 'reviewInvitationEmailTemplate35',
      },
      {
        label: 'Martin Lindquist - Peer-Review Invitation Assignment',
        value: 'reviewInvitationEmailTemplate36',
      },
      {
        label: 'Bradley Buchsbaum - Peer-Review Invitation Assignment',
        value: 'reviewInvitationEmailTemplate37',
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
      currentUser.username
    } to ${receiverName}`

    const channelId = message.manuscript.channels.find(
      channel => channel.topic === 'Editorial discussion',
    ).id

    await sendChannelMessageCb({ content: body, channelId })
  }

  const sendEmailHandler = async () => {
    if (!selectedTemplate || !manuscript) return

    const input = isNewUser
      ? { externalEmail, externalName, selectedTemplate, manuscript }
      : { selectedEmail, selectedTemplate, manuscript }

    if (isNewUser && (!externalName || !externalEmail)) return
    if (!isNewUser && !selectedEmail) return
    const response = await sendNotifyEmail(input)
    const responseStatus = response.data.sendEmail.success
    if (responseStatus) logMessageAfterEmailSent(input)
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
