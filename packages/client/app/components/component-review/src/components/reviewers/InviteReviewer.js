import { Formik } from 'formik'
import React, { useState, useContext } from 'react'
import { useTranslation } from 'react-i18next'
import {
  SectionContent,
  SectionHeader,
  SectionRow,
  Title,
} from '../../../../shared'
import {
  sendEmail,
  sendEmailChannelMessage,
} from '../emailNotifications/emailUtils'
import InviteReviewerModal from './InviteReviewerModal'
import ReviewerForm from './ReviewerForm'
import { ConfigContext } from '../../../../config/src'

const InviteReviewer = ({
  reviewerUsers,
  manuscript,
  addReviewer,
  updateSharedStatusForInvitedReviewer,
  currentUser,
  sendNotifyEmail,
  sendChannelMessage,
  selectedEmail,
  selectedEmailIsBlacklisted,
  setExternalEmail,
  updateTeamMember,
  emailTemplates,
}) => {
  const config = useContext(ConfigContext)
  const [open, setOpen] = useState(false)
  const { t } = useTranslation()

  const [userId, setUserId] = useState(undefined)

  const [isNewUser, setIsNewUser] = useState(false)
  const [notificationStatus, setNotificationStatus] = useState(null)

  let reviewerInvitationEmailTemplate

  if (config.eventNotification?.reviewerInvitationPrimaryEmailTemplate) {
    reviewerInvitationEmailTemplate =
      config.eventNotification.reviewerInvitationPrimaryEmailTemplate
  } else {
    reviewerInvitationEmailTemplate = emailTemplates.find(
      template => template.emailTemplateType === 'reviewerInvitation',
    ).id
  }

  return (
    <>
      <Formik
        displayName="reviewers"
        initialValues={{ user: undefined, email: undefined, name: undefined }}
        onSubmit={async values => {
          if (!isNewUser) {
            setOpen(true)
            setUserId(values.user.id)
          } else {
            setNotificationStatus('pending')

            const output = await sendEmail(
              manuscript,
              isNewUser,
              currentUser,
              sendNotifyEmail,
              reviewerInvitationEmailTemplate,
              selectedEmail,
              values.email,
              values.name,
              selectedEmailIsBlacklisted,
              config.groupId,
            )

            setNotificationStatus(output?.invitation ? 'success' : 'failure')

            if (output?.input) {
              sendEmailChannelMessage(
                sendChannelMessage,
                currentUser,
                output.input,
                reviewerUsers.map(reviewer => ({
                  userName: reviewer.username,
                  value: reviewer.email,
                })),
                emailTemplates,
              )
            }
          }
        }}
      >
        {formikProps => (
          <>
            <SectionContent>
              <SectionHeader>
                <Title>{t('decisionPage.Invite Reviewers')}</Title>
              </SectionHeader>
              <SectionRow>
                <ReviewerForm
                  {...formikProps}
                  isNewUser={isNewUser}
                  notificationStatus={notificationStatus}
                  optedOut={selectedEmailIsBlacklisted}
                  reviewerUsers={reviewerUsers}
                  setExternalEmail={setExternalEmail}
                  setIsNewUser={setIsNewUser}
                />
              </SectionRow>
            </SectionContent>
          </>
        )}
      </Formik>
      <InviteReviewerModal
        addReviewer={addReviewer}
        currentUser={currentUser}
        emailTemplates={emailTemplates}
        manuscript={manuscript}
        onClose={() => setOpen(false)}
        open={open}
        reviewerInvitationEmailTemplate={reviewerInvitationEmailTemplate}
        reviewerUsers={reviewerUsers}
        selectedEmail={selectedEmail}
        sendChannelMessage={sendChannelMessage}
        sendNotifyEmail={sendNotifyEmail}
        updateSharedStatusForInvitedReviewer={
          updateSharedStatusForInvitedReviewer
        }
        updateTeamMember={updateTeamMember}
        userId={userId}
      />
    </>
  )
}

export default InviteReviewer
