import React from 'react'
import styled from 'styled-components'
import { th } from '@pubsweet/ui-toolkit'
import SimpleWaxEditor from '../../wax-collab/src/SimpleWaxEditor'

const EmailContentWrapper = styled.div`
  display: flex;
  flex-direction: column;

  p {
    margin-bottom: 20px;
  }
`

const EmailHeader = styled.p`
  color: ${th('colorPrimary')};
  font-family: ${th('fontReading')};
  font-size: ${th('fontSizeHeading6')};
  margin: ${th('gridUnit')} 0;
  text-transform: uppercase;
`

const EmailTemplateContent = ({ activeTemplate }) => {
  return (
    <EmailContentWrapper key={activeTemplate?.id}>
      <EmailHeader>Subject</EmailHeader>
      <SimpleWaxEditor readonly value={activeTemplate?.emailContent.subject} />
      <EmailHeader>CC</EmailHeader>
      <SimpleWaxEditor readonly value={activeTemplate?.emailContent.cc} />
      <EmailHeader>Body</EmailHeader>
      <SimpleWaxEditor readonly value={activeTemplate?.emailContent.body} />
    </EmailContentWrapper>
  )
}

export default EmailTemplateContent
