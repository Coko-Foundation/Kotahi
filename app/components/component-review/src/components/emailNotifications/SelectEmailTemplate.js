import React from 'react'
import { Select } from '../../../../shared'

let emailTemplateOptions = []

switch (
  process.env.INSTANCE_NAME // TODO: optimize without instance name, refactor below template logic in future
) {
  case 'aperture':
    emailTemplateOptions = [
      {
        label:
          'Adam Thomas - Peer-Review Invitation Assignment notification template',
        value: 'reviewInvitationEmailTemplate4',
      },
      {
        label: 'Adhoc EIC - Handling Editor Assignment notification template',
        value: 'adhocEditorAssignmentEmailTemplate',
      },
      {
        label:
          'Alexandre Gramfort - Peer-Review Invitation Assignment notification template',
        value: 'reviewInvitationEmailTemplate31',
      },
      {
        label:
          'Angela Laird - Peer-Review Invitation Assignment notification template',
        value: 'reviewInvitationEmailTemplate21',
      },
      {
        label:
          'Anqi Qiu - Peer-Review Invitation Assignment notification template',
        value: 'reviewInvitationEmailTemplate16',
      },
      {
        label:
          'Archana Venkataraman - Peer-Review Invitation Assignment notification template',
        value: 'reviewInvitationEmailTemplate24',
      },
      {
        label:
          'Armin Raznahan - Peer-Review Invitation Assignment notification template',
        value: 'reviewInvitationEmailTemplate17',
      },
      {
        label:
          'Athina Tzovara - Peer-Review Invitation Assignment notification template',
        value: 'reviewInvitationEmailTemplate13',
      },
      {
        label: 'Author Invitation Email Template',
        value: 'authorInvitationEmailTemplate',
      },
      {
        label:
          'Bertrand Thirion - Peer-Review Invitation Assignment notification template',
        value: 'reviewInvitationEmailTemplate34',
      },
      {
        label:
          'Bradley Buchsbaum - Peer-Review Invitation Assignment notification template',
        value: 'reviewInvitationEmailTemplate37',
      },
      {
        label:
          'Catie Chang - Peer-Review Invitation Assignment notification template',
        value: 'reviewInvitationEmailTemplate2',
      },
      {
        label:
          'Cyril Pernet - Peer-Review Invitation Assignment notification template',
        value: 'reviewInvitationEmailTemplate33',
      },
      {
        label:
          'Daniel Margulies - Peer-Review Invitation Assignment notification template',
        value: 'reviewInvitationEmailTemplate35',
      },
      {
        label:
          'Edson Amaro - Peer-Review Invitation Assignment notification template',
        value: 'reviewInvitationEmailTemplate28',
      },
      {
        label:
          'Hiromasa Takemura - Peer-Review Invitation Assignment notification template',
        value: 'reviewInvitationEmailTemplate8',
      },
      {
        label:
          'Jean Chen - Peer-Review Invitation Assignment notification template',
        value: 'reviewInvitationEmailTemplate20',
      },
      {
        label:
          'Jing Xiang - Peer-Review Invitation Assignment notification template',
        value: 'reviewInvitationEmailTemplate11',
      },
      {
        label:
          'Jorge Moll - Peer-Review Invitation Assignment notification template',
        value: 'reviewInvitationEmailTemplate19',
      },
      {
        label:
          'Kendrick Kay - Peer-Review Invitation Assignment notification template',
        value: 'reviewInvitationEmailTemplate30',
      },
      {
        label: 'Kotahi task notification',
        value: 'genericTaskNotificationEmailTemplate',
      },
      {
        label:
          'Lucina Uddin - Peer-Review Invitation Assignment notification template',
        value: 'reviewInvitationEmailTemplate6',
      },
      {
        label:
          'Mallar Chakravarty - Handling Editor Assignment notification template',
        value: 'deputyEditorAssignmentEmailTemplate',
      },
      {
        label:
          'Mallar Chakravarty - Peer-Review Invitation Assignment notification template',
        value: 'reviewInvitationEmailTemplate15',
      },
      {
        label:
          'Martin Lindquist - Peer-Review Invitation Assignment notification template',
        value: 'reviewInvitationEmailTemplate36',
      },
      {
        label:
          'Memba Jabbi - Peer-Review Invitation Assignment notification template',
        value: 'reviewInvitationEmailTemplate27',
      },
      {
        label:
          'Meredith Reid - Peer-Review Invitation Assignment notification template',
        value: 'reviewInvitationEmailTemplate23',
      },
      {
        label: 'Message notification template',
        value: 'messageNotificationEmailTemplate',
      },
      {
        label:
          'Michele Veldsman - Peer-Review Invitation Assignment notification template',
        value: 'reviewInvitationEmailTemplate25',
      },
      {
        label:
          'Mitchell Valdes Sosa - Peer-Review Invitation Assignment notification template',
        value: 'reviewInvitationEmailTemplate18',
      },
      {
        label:
          'Molly Bright - Peer-Review Invitation Assignment notification template',
        value: 'reviewInvitationEmailTemplate9',
      },
      {
        label:
          'Philip Shaw - Peer-Review Invitation Assignment notification template',
        value: 'reviewInvitationEmailTemplate14',
      },
      {
        label:
          'Pierre Bellec - Peer-Review Invitation Assignment notification template',
        value: 'reviewInvitationEmailTemplate7',
      },
      {
        label:
          'Renzo Huber - Peer-Review Invitation Assignment notification template',
        value: 'reviewInvitationEmailTemplate32',
      },
      {
        label: 'Review Assignment notification template',
        value: 'reviewAssignmentEmailTemplate',
      },
      {
        label: 'Review Complete notification template',
        value: 'reviewCompleteEmailTemplate',
      },
      {
        label: 'Reviewer Invitation Email Template',
        value: 'reviewerInvitationEmailTemplate',
      },
      {
        label:
          'Satrajit Ghosh - Peer-Review Invitation Assignment notification template',
        value: 'reviewInvitationEmailTemplate3',
      },
      {
        label:
          'Sharlene Newman - Peer-Review Invitation Assignment notification template',
        value: 'reviewInvitationEmailTemplate26',
      },
      {
        label:
          'Tianzi Jiang - Peer-Review Invitation Assignment notification template',
        value: 'reviewInvitationEmailTemplate10',
      },
      {
        label: 'Tonya White - Handling Editor Assignment notification template',
        value: 'editorAssignmentEmailTemplate',
      },
      {
        label:
          'Uzay Emir - Peer-Review Invitation Assignment notification template',
        value: 'reviewInvitationEmailTemplate1',
      },
      {
        label:
          'Valeria Della-Maggiore - Peer-Review Invitation Assignment notification template',
        value: 'reviewInvitationEmailTemplate22',
      },
      {
        label:
          'Vincent Clark - Peer-Review Invitation Assignment notification template',
        value: 'reviewInvitationEmailTemplate5',
      },
      {
        label:
          'Won Mok Shim - Peer-Review Invitation Assignment notification template',
        value: 'reviewInvitationEmailTemplate12',
      },
    ]
    break
  case 'colab':
    emailTemplateOptions = [
      {
        label: 'Author Invitation Email Template',
        value: 'authorInvitationEmailTemplate',
      },
      {
        label: 'Share consolidated report with authors',
        value: 'consolidatedReportWithAuthorsTemplate',
      },
      {
        label: 'Evaluation Complete Required Notification Template',
        value: 'evaluationCompleteEmailTemplate',
      },
      {
        label: 'Follow-up with author to submit revised preprint ',
        value: 'authorFollowUpSubmitRevisedPreprintTemplate',
      },
      {
        label: 'Generic task manager update notification',
        value: 'genericTaskManagerUpdateNotificationTemplate',
      },
      {
        label: 'Kotahi task notification',
        value: 'genericTaskNotificationEmailTemplate',
      },
      {
        label: 'Reminder: Author Invitation Template',
        value: 'reminderAuthorInvitationTemplate',
      },
      {
        label: 'Reminder: Review Overdue Template',
        value: 'reminderReviewOverdueTemplate',
      },
      {
        label: 'Reminder: Reviewer Invitation Template',
        value: 'reminderReviewerInvitationTemplate',
      },
      {
        label: 'Report published',
        value: 'reportPublishedTemplate',
      },
      {
        label: 'Report(s) shared',
        value: 'reportsSharedTemplate',
      },
      {
        label: 'Reviewer Invitation Email Template',
        value: 'reviewInvitationEmailTemplate',
      },
      {
        label: 'Reviewer invitation - new reviewer for a revised preprint',
        value: 'reviewerInvitationRevisedPreprintTemplate',
      },
      {
        label: 'Reviewer invitation - re-review',
        value: 'reviewerInvitationReReviewTemplate',
      },
      {
        label: 'Thanks for Agreeing to Review Template',
        value: 'thanksForAgreeingToReviewTemplate',
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

    if (
      !process.env.USE_COLAB_EMAIL ||
      process.env.USE_COLAB_EMAIL.toLowerCase() !== 'true'
    ) {
      emailTemplateOptions = [
        {
          label: 'Kotahi task notification',
          value: 'genericTaskNotificationEmailTemplate',
        },

        {
          label: 'Reviewer Invitation Email Template',
          value: 'reviewInvitationEmailTemplate',
        },

        {
          label: 'Author Invitation Email Template',
          value: 'authorInvitationEmailTemplate',
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
    }

    break
  default:
    emailTemplateOptions = [
      {
        label: 'Kotahi task notification',
        value: 'genericTaskNotificationEmailTemplate',
      },
      {
        label: 'Message notification template',
        value: 'messageNotificationEmailTemplate',
      },
      {
        label: 'Review Assignment notification template',
        value: 'reviewAssignmentEmailTemplate',
      },
    ]
    break
}

const SelectEmailTemplate = ({
  onChangeEmailTemplate,
  selectedEmailTemplate,
  updateTaskNotification,
  taskEmailNotification,
  placeholder,
  isClearable,
  task,
}) => {
  return (
    <Select
      aria-label="Notification_email_select"
      data-testid="Notification_email_select"
      isClearable={isClearable || false}
      label="notification email"
      menuPortalTarget={document.querySelector('body')}
      onChange={selected => {
        if (taskEmailNotification) {
          updateTaskNotification({
            ...taskEmailNotification,
            id: taskEmailNotification.id,
            taskId: taskEmailNotification.taskId,
            emailTemplateKey: selected ? selected.value : '',
          })
        }

        onChangeEmailTemplate(selected ? selected.value : '')
      }}
      options={emailTemplateOptions}
      placeholder={placeholder || 'Choose notification template'}
      value={selectedEmailTemplate}
    />
  )
}

export default SelectEmailTemplate
