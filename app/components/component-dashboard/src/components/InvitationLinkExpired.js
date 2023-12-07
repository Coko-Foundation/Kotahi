import React, { useContext } from 'react'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation()
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
            <DeclinedInfoString>{t('linkExpiredPage')}</DeclinedInfoString>
          </FeedbackForm>
        </InvitationContent>
      </Centered>
    </InvitationContainer>
  )
}

export default InvitationLinkExpired
