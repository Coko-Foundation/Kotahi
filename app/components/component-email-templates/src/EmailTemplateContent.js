import React from 'react'
import styled from 'styled-components'
import { th } from '@pubsweet/ui-toolkit'
import { useTranslation } from 'react-i18next'
import SimpleWaxEditor from '../../wax-collab/src/SimpleWaxEditor'

const EmailContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 20px 20px 0px 0px;
`

const EmailBody = styled.div`
  p {
    margin-bottom: 20px;
  }

  div {
    height: 100%;
  }
  height: 60vh;
  overflow: scroll;
`

const EmailHeader = styled.p`
  color: ${th('colorPrimary')};
  font-family: ${th('fontReading')};
  font-size: ${th('fontSizeHeading6')};
  margin: 20px 0px;
  text-transform: uppercase;
`

const EmailTemplateContent = ({ activeTemplate }) => {
  const { t } = useTranslation()
  return (
    <EmailContentWrapper key={activeTemplate?.id}>
      <EmailHeader>{t('emailtemplatesPage.Subject')}</EmailHeader>
      <SimpleWaxEditor readonly value={activeTemplate?.emailContent.subject} />
      <EmailHeader>{t('emailtemplatesPage.CC')}</EmailHeader>
      <SimpleWaxEditor readonly value={activeTemplate?.emailContent.cc} />
      <EmailHeader>{t('emailtemplatesPage.Body')}</EmailHeader>
      <EmailBody>
        <SimpleWaxEditor readonly value={activeTemplate?.emailContent.body} />
      </EmailBody>
    </EmailContentWrapper>
  )
}

export default EmailTemplateContent
