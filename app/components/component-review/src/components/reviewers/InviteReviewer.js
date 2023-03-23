import { Formik } from 'formik'
import React, { useState } from 'react'
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
}) => {
  const [open, setOpen] = useState(false)

  const [userId, setUserId] = useState(undefined)

  const [isNewUser, setIsNewUser] = useState(false)
  const [notificationStatus, setNotificationStatus] = useState(null)

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
              'reviewerInvitationEmailTemplate',
              selectedEmail,
              values.email,
              values.name,
              selectedEmailIsBlacklisted,
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
              )
            }
          }
        }}
      >
        {formikProps => (
          <>
            <SectionContent>
              <SectionHeader>
                <Title>Invite Reviewers</Title>
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
        manuscript={manuscript}
        onClose={() => setOpen(false)}
        open={open}
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
