import React, { useState, useContext } from 'react'
import { Checkbox, TextArea } from '@pubsweet/ui/dist/atoms'
import { Button } from '@pubsweet/ui'
import { useMutation, useQuery } from '@apollo/client'
import { ADD_EMAIL_TO_BLACKLIST } from '../../../../queries/index'
import {
  UPDATE_INVITATION_RESPONSE,
  UPDATE_INVITATION_STATUS,
  GET_INVITATION_STATUS,
} from '../../../../queries/invitation'
import { ConfigContext } from '../../../config/src'
import {
  ButtonWrapper,
  Centered,
  DeclinedInfoString,
  FeedbackForm,
  FormInput,
  InvitationContainer,
  InvitationContent,
  SubmitFeedbackNote,
  ThankYouString,
} from '../style'
import InvitationLinkExpired from './InvitationLinkExpired'

const DeclineArticleOwnershipPage = ({ match }) => {
  const config = useContext(ConfigContext)
  const { invitationId } = match.params

  const { data } = useQuery(GET_INVITATION_STATUS, {
    variables: { id: invitationId },
  })

  const [updateInvitationStatus] = useMutation(UPDATE_INVITATION_STATUS, {
    onCompleted: () => {
      localStorage.removeItem('invitationId')
    },
  })

  const [addEmailToBlacklist] = useMutation(ADD_EMAIL_TO_BLACKLIST, {
    onCompleted: () => {
      setIsFormSubmitted(true)
    },
  })

  const [isFormSubmitted, setIsFormSubmitted] = useState(false)

  const [updateInvitationResponse] = useMutation(UPDATE_INVITATION_RESPONSE, {
    onCompleted: blacklistData => {
      // TODO It would be cleaner and safer to have this logic in the server, rather than allowing the client to initiate these actions.
      if (
        blacklistData.updateInvitationResponse.declinedReason ===
        'DO_NOT_CONTACT'
      ) {
        addEmailToBlacklist({
          variables: {
            email: blacklistData.updateInvitationResponse.toEmail,
            groupId: config.groupId,
          },
        })
      } else {
        setIsFormSubmitted(true)
      }
    },
  })

  const [checked, setChecked] = useState(false)
  const [feedbackComment, setFeedbackComment] = useState('')

  const handleChange = () => {
    setChecked(!checked)
  }

  const handleDeclineAction = () => {
    if (data && data.invitationStatus.status === 'UNANSWERED') {
      updateInvitationStatus({
        variables: {
          id: invitationId,
          status: 'REJECTED',
          responseDate: new Date(),
        },
      })
    }

    updateInvitationResponse({
      variables: {
        id: invitationId,
        responseComment: feedbackComment,
        declinedReason: checked ? 'DO_NOT_CONTACT' : null,
      },
    })
  }

  if (isFormSubmitted) {
    return (
      <InvitationContainer>
        <Centered>
          <InvitationContent>
            <img
              alt={config?.groupIdentity?.brandName}
              src={config?.groupIdentity?.logoPath}
            />
            <ThankYouString>
              You have declined the invitation. Thank-you for your response.
            </ThankYouString>
          </InvitationContent>
        </Centered>
      </InvitationContainer>
    )
  }

  if (data && data.invitationStatus.status === 'UNANSWERED') {
    return (
      <InvitationContainer>
        <Centered>
          <InvitationContent>
            <img
              alt={config?.groupIdentity?.brandName}
              src={config?.groupIdentity?.logoPath}
            />
            <FeedbackForm>
              <DeclinedInfoString>
                Are you sure you want to decline this invitation to participate
                in a peer review?
              </DeclinedInfoString>
              <SubmitFeedbackNote>
                You may wish to share your reason for declining the invitation
                below (optional)
              </SubmitFeedbackNote>
              <FormInput>
                <TextArea
                  onChange={event => setFeedbackComment(event.target.value)}
                  placeholder="Your message here..."
                  rows="4"
                  value={feedbackComment}
                />
                <Checkbox
                  checked={checked}
                  label="I don’t want to be contacted again"
                  onChange={handleChange}
                />
              </FormInput>
            </FeedbackForm>
            <ButtonWrapper>
              <Button onClick={handleDeclineAction} primary type="submit">
                Decline Invitation
              </Button>
            </ButtonWrapper>
          </InvitationContent>
        </Centered>
      </InvitationContainer>
    )
  }

  return <InvitationLinkExpired />
}

export default DeclineArticleOwnershipPage
