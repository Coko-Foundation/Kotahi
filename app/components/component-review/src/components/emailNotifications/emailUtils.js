import { convertTimestampToDateString } from '../../../../../shared/dateUtils'

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
    label: 'Reviewer Invitation notification',
    value: 'reviewerInvitationEmailTemplate',
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
    label: 'Share evaluation with author',
    value: 'notifyAuthorEmailTemplate',
  },
  {
    label: 'Evaluation published',
    value: 'evaluationPublishedEmailTemplate',
  },
]

export const sendEmail = async (
  manuscript,
  isNewUser,
  currentUser,
  sendNotifyEmail,
  selectedTemplate,
  selectedEmail,
  externalEmail,
  externalName,
  selectedEmailIsBlacklisted,
) => {
  if (selectedEmailIsBlacklisted) return undefined
  if (!selectedTemplate || !manuscript) return undefined

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

  if (isNewUser && (!externalName || !externalEmail)) return undefined
  if (!isNewUser && !selectedEmail) return undefined

  const response = await sendNotifyEmail(input)
  const { invitation } = response.data.sendEmail
  if (invitation) return { invitation, input }
  return undefined
}

export const sendEmailChannelMessage = async (
  sendChannelMessage,
  currentUser,
  input,
  reviewers = [],
) => {
  const selectedTempl = emailTemplateOptions.find(
    template => template.value === input.selectedTemplate,
  ).label

  const receiverName = input.externalEmail
    ? input.externalName
    : reviewers.find(user => user.value === input.selectedEmail).userName

  const date = Date.now()

  const body = `${convertTimestampToDateString(
    date,
  )} - ${selectedTempl} sent by ${currentUser.username} to ${receiverName}`

  const channelId = input.manuscript.channels.find(
    channel => channel.topic === 'Editorial discussion',
  ).id

  await sendChannelMessage({ content: body, channelId })
}
