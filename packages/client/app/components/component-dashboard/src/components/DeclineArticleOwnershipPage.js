import React, { useState, useContext } from 'react'
import { useMutation, useQuery } from '@apollo/client'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'

import { Button, Checkbox, TextArea } from '../../../pubsweet'
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
import AuthorsInput from '../../../component-submit/src/components/AuthorsInput'

const SuggestedReviewersContainer = styled.div`
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  margin: 7px auto;
  width: 100%;

  > div > div {
    align-items: flex-start;
    display: flex;
    flex-direction: column;
  }
`

const SuggestedReviewersScrollable = styled.div`
  max-height: 200px;
  overflow-y: scroll;
  width: 100%;
`

const SuggestedReviewersSectionLabel = styled.h4`
  font-weight: bold;
  margin-bottom: 5px;
`

const StyledFormInput = styled(FormInput)`
  label > span {
    color: #666;
    font-size: 16px;
    font-weight: 500;
  }
`

const DeclineArticleOwnershipPage = ({ match }) => {
  const config = useContext(ConfigContext)
  const { invitationId } = match.params

  const [checked, setChecked] = useState(false)
  const [feedbackComment, setFeedbackComment] = useState('')
  const [suggestedReviewers, setSuggestedReviewers] = useState([])

  const { data } = useQuery(GET_INVITATION_STATUS, {
    variables: { id: invitationId },
  })

  const { t } = useTranslation()

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
        suggestedReviewers: suggestedReviewers.map(reviewer => ({
          firstName: reviewer.firstName,
          lastName: reviewer.lastName,
          email: reviewer.email,
          affiliation: reviewer.affiliation,
        })),
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
              src={
                config?.logo?.storedObjects[0].url ||
                config?.groupIdentity?.logoPath
              }
            />
            <ThankYouString>{t('declineReviewPage.thanks')}</ThankYouString>
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
              src={
                config?.logo?.storedObjects[0].url ||
                config?.groupIdentity?.logoPath
              }
            />
            <FeedbackForm>
              <DeclinedInfoString>
                {t('declineReviewPage.youHaveDeclined')}
              </DeclinedInfoString>
              <SubmitFeedbackNote>
                {t('declineReviewPage.reason')}
              </SubmitFeedbackNote>
              <StyledFormInput>
                <TextArea
                  onChange={event => setFeedbackComment(event.target.value)}
                  placeholder={t('declineReviewPage.messageHere')}
                  rows="4"
                  value={feedbackComment}
                />
                <SuggestedReviewersContainer>
                  <SuggestedReviewersSectionLabel>
                    Suggested Reviewers
                  </SuggestedReviewersSectionLabel>
                  <SuggestedReviewersScrollable>
                    <AuthorsInput
                      onChange={setSuggestedReviewers}
                      overrideButtonLabel="Add Suggested Reviewer"
                      value={suggestedReviewers}
                    />
                  </SuggestedReviewersScrollable>
                </SuggestedReviewersContainer>
                <Checkbox
                  checked={checked}
                  label={t('declineReviewPage.dontWantContact')}
                  onChange={handleChange}
                />
              </StyledFormInput>
            </FeedbackForm>
            <ButtonWrapper>
              <Button onClick={handleDeclineAction} primary type="submit">
                {t('declineReviewPage.Decline Invitation')}
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
