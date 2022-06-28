import React from 'react'
import brandConfig from '../../../../brandConfig.json'

import {
  Centered,
  InvitationContent,
  DeclinedInfoString,
  FeedbackForm,
  InvitationContainer,
} from '../style'

const InvitationLinkExpired = () => {
  return (
    <InvitationContainer>
      <Centered>
        <InvitationContent>
          <img alt={brandConfig.brandName} src={brandConfig.logoPath} />
          <FeedbackForm>
            <DeclinedInfoString>
              The Invitation link is EXPIRED, please contact admin to send a new
              link
            </DeclinedInfoString>
          </FeedbackForm>
        </InvitationContent>
      </Centered>
    </InvitationContainer>
  )
}

export default InvitationLinkExpired
