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
              This invitation link has expired. Please contact the system
              administrator to send a new invitation.
            </DeclinedInfoString>
          </FeedbackForm>
        </InvitationContent>
      </Centered>
    </InvitationContainer>
  )
}

export default InvitationLinkExpired
