import React, { useEffect, useState } from 'react'
import { Checkbox, TextArea } from '@pubsweet/ui/dist/atoms'
import { Button } from '@pubsweet/ui'
import { useMutation, useQuery } from '@apollo/client'
import {
  UPDATE_INVITATION_RESPONSE,
  UPDATE_INVITATION_STATUS,
  ADD_EMAIL_TO_BLACKLIST,
  GET_INVITATION_STATUS,
} from '../../../../queries/index'
import brandConfig from '../../../../brandConfig.json'
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
          variables: { email: blacklistData.updateInvitationResponse.toEmail },
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

  useEffect(() => {
    if (data && data.invitationStatus.status === 'UNANSWERED') {
      updateInvitationStatus({
        variables: {
          id: invitationId,
          status: 'REJECTED',
          responseDate: new Date(),
        },
      })
    }
  }, [data])

  if (isFormSubmitted) {
    return (
      <InvitationContainer>
        <Centered>
          <InvitationContent>
            <img alt={brandConfig.brandName} src={brandConfig.logoPath} />
            <ThankYouString>
              Thank you for submitting the feedback.
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
            <img alt={brandConfig.brandName} src={brandConfig.logoPath} />
            <FeedbackForm>
              <DeclinedInfoString>
                You have declined an invitation to participate in a peer review.
              </DeclinedInfoString>
              <SubmitFeedbackNote>
                Please share your reasons for declining the invitation below.
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
              <Button
                onClick={() =>
                  updateInvitationResponse({
                    variables: {
                      id: invitationId,
                      responseComment: feedbackComment,
                      declinedReason: checked ? 'DO_NOT_CONTACT' : 'OTHER',
                    },
                  })
                }
                primary
                type="submit"
              >
                Submit Feedback
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
