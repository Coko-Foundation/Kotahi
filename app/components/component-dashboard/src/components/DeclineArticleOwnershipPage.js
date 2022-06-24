import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { th, grid } from '@pubsweet/ui-toolkit'
import { Checkbox, TextArea } from '@pubsweet/ui/dist/atoms'
import { Button } from '@pubsweet/ui'
import { useMutation, useQuery } from '@apollo/client'
import lightenBy from '../../../../shared/lightenBy'
import {
  UPDATE_INVITATION_RESPONSE,
  UPDATE_INVITATION_STATUS,
  ADD_EMAIL_TO_BLACKLIST,
  GET_INVITATION_STATUS,
} from '../../../../queries/index'
import brandConfig from '../../../../brandConfig.json'

const Centered = styled.div`
  text-align: center;
`

const Content = styled.div`
  background: ${th('colorBackground')};
  border-radius: ${th('borderRadius')};
  box-shadow: ${th('boxShadow')};
  margin-bottom: 1rem;
  max-width: 50em;
  padding: ${grid(4)};
  text-align: center;
  width: 800px;

  h1 {
    margin-bottom: ${grid(2)};
  }

  img {
    height: auto;
    max-height: 307px;
    max-width: 475px;
    width: auto;
  }
`

const ButtonWrapper = styled.div`
  button {
    font-family: ${th('fontWriting')};
    font-size: 16px;
    font-weight: 500;
    margin-bottom: 15px;
    padding: 10px 20px;
    text-align: left;
  }
`

const FeedbackForm = styled.p`
  padding: 20px 40px;
`

const DeclinedInfoString = styled.p`
  color: ${th('colorText')};
  font-family: ${th('fontWriting')};
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 6px;
  text-align: left;
`

const SubmitFeedbackNote = styled.p`
  color: ${th('colorIconPrimary')};
  font-family: ${th('fontWriting')};
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 15px;
  text-align: left;
`

const ThankYouString = styled.p`
  color: ${th('colorIconPrimary')};
  font-family: ${th('fontWriting')};
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 15px;
  text-align: center;
`

const FormInput = styled.div`
  margin-bottom: 20px;

  textarea {
    background: ${th('colorBackgroundHue')};
    margin-bottom: 15px;
    padding: 20px;
  }
`

const Container = styled.div`
  background: linear-gradient(
    134deg,
    ${th('colorPrimary')},
    ${lightenBy('colorPrimary', 0.3)}
  );
  display: grid;
  height: 100vh;
  place-items: center;
`

const DeclineArticleOwnershipPage = ({ match }) => {
  const authorInvitationId = match.params.invitationId

  const { data } = useQuery(GET_INVITATION_STATUS, {
    variables: { id: authorInvitationId },
  })

  const [updateInvitationStatus] = useMutation(UPDATE_INVITATION_STATUS, {
    onCompleted: () => {
      localStorage.removeItem('authorInvitationId')
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
        variables: { id: authorInvitationId, status: 'REJECTED' },
      })
    }
  }, [data])

  if (isFormSubmitted) {
    return (
      <Container>
        <Centered>
          <Content>
            <img alt={brandConfig.brandName} src={brandConfig.logoPath} />
            <ThankYouString>
              Thank you for submitting the feedback.
            </ThankYouString>
          </Content>
        </Centered>
      </Container>
    )
  }

  if (data && data.invitationStatus.status === 'UNANSWERED') {
    return (
      <Container>
        <Centered>
          <Content>
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
                      id: authorInvitationId,
                      responseComment: feedbackComment,
                      responseDate: new Date(),
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
          </Content>
        </Centered>
      </Container>
    )
  }

  return (
    <Container>
      <Centered>
        <Content>
          <img alt={brandConfig.brandName} src={brandConfig.logoPath} />
          <FeedbackForm>
            <DeclinedInfoString>
              The Invitation link is EXPIRED, please contact admin to send a new
              link
            </DeclinedInfoString>
          </FeedbackForm>
        </Content>
      </Centered>
    </Container>
  )
}

export default DeclineArticleOwnershipPage
