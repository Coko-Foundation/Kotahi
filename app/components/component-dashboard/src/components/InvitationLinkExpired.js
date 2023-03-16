import React, { useContext } from 'react'
import { ConfigContext } from '../../../config/src'

import {
  Centered,
  InvitationContent,
  DeclinedInfoString,
  FeedbackForm,
  InvitationContainer,
} from '../style'

const InvitationLinkExpired = () => {
  const config = useContext(ConfigContext)
  return (
    <InvitationContainer>
      <Centered>
        <InvitationContent>
          <img
            alt={config.groupIdentity.brandName}
            src={config.groupIdentity.logoPath}
          />
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
