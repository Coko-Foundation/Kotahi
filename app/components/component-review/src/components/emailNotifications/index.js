import React, { useState } from 'react'
import { th } from '@pubsweet/ui-toolkit'
import styled, { css } from 'styled-components'
import { SectionHeader, SectionRowGrid, Title } from '../style'
import { SectionContent } from '../../../../shared'
import SelectReceiver from './SelectReceiver'
import SelectEmailTemplate from './SelectEmailTemplate'
import { convertTimestampToDate } from '../../../../../shared/time-formatting'
import ActionButton from '../../../../shared/ActionButton'

const UserEmailWrapper = styled.div`
  font-size: ${th('fontSizeBaseSmall')};
  line-height: ${th('lineHeightBaseSmall')};
`

const editorOption = user => ({
  label: (
    <>
      <div>{user.username}</div>{' '}
      <UserEmailWrapper>{user.email}</UserEmailWrapper>{' '}
    </>
  ),
  value: user.email,
  userName: user.username,
})

const MessageWrapper = styled.div`
  color: ${th('colorError')};
  font-family: ${th('fontInterface')};
  font-size: ${th('fontSizeBaseSmall')};
  line-height: ${th('lineHeightBaseSmall')};

  ${props =>
    props.isVisible === true
      ? css`
          display: flex;
        `
      : css`
          display: none;
        `}

  padding: calc(8px * 2) calc(8px * 3);

  &:not(:last-child) {
    margin-bottom: ${th('gridUnit')};
  }
`

const RowGridStyled = styled(SectionRowGrid)`
  grid-template-columns: repeat(5, minmax(0, 1fr));
`

const EmailNotifications = ({
  manuscript,
  allUsers,
  currentUser,
  sendNotifyEmail,
  sendChannelMessageCb,
  selectedEmail,
  externalEmail,
  setSelectedEmail,
  setExternalEmail,
  isEmailAddressOptedOut,
}) => {
  const [externalName, setExternalName] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [isNewUser, setIsNewUser] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [notificationStatus, setNotificationStatus] = useState(null)

  const resetAll = () => {
    setExternalEmail('')
    setSelectedEmail('')
    setExternalName('')
    setSelectedTemplate('')
    setIsVisible(false)
  }

  const handlerForNewUserToggle = () => {
    resetAll()
    setIsNewUser(s => !s)
  }

  const options = (allUsers || [])
    .filter(user => user.email)
    .map(user => editorOption(user))

  const logMessageAfterEmailSent = async message => {
    const emailTemplateOptions = [
      {
        label: 'Author Invitation Email Template',
        value: 'authorInvitationEmailTemplate',
      },
      {
        label: 'Reminder: Author invitation',
        value: 'reminderAuthorInvitationTemplate',
      },
      {
        label: 'Reminder: Reviewer invitation',
        value: 'reminderReviewerInvitationTemplate',
      },
      {
        label: 'Thanks for agreeing to review',
        value: 'thanksForAgreeingToReviewTemplate',
      },
      {
        label: 'Reminder: Review overdue',
        value: 'reminderReviewOverdueTemplate',
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
      {
        label: 'Reviewer Invitation Email Template',
        value: 'reviewerInvitationEmailTemplate',
      },
    ]

    const selectedTempl = emailTemplateOptions.find(
      template => template.value === message.selectedTemplate,
    ).label

    const receiverName = message.externalEmail
      ? message.externalName
      : options.find(user => user.value === message.selectedEmail).userName

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
    setNotificationStatus('pending')

    if (isEmailAddressOptedOut?.data?.getBlacklistInformation.length) {
      setIsVisible(true)
      return
    }

    if (!selectedTemplate || !manuscript) return

    const input = isNewUser
      ? {
          externalEmail,
          externalName,
          selectedTemplate,
          manuscript,
          currentUser: currentUser.username,
        }
      : {
          selectedEmail,
          selectedTemplate,
          manuscript,
          currentUser: currentUser.username,
        }

    if (isNewUser && (!externalName || !externalEmail)) return
    if (!isNewUser && !selectedEmail) return

    const response = await sendNotifyEmail(input)
    const responseStatus = response.data.sendEmail.success
    setNotificationStatus(responseStatus ? 'success' : 'failure')

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
        <ActionButton
          onClick={sendEmailHandler}
          primary
          status={notificationStatus}
        >
          Notify
        </ActionButton>
      </RowGridStyled>
      <MessageWrapper isVisible={isVisible}>
        User email address opted out
      </MessageWrapper>
    </SectionContent>
  )
}

export default EmailNotifications
