import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { th } from '@pubsweet/ui-toolkit'
import { Container, Heading, SectionContent, WidthLimiter } from '../../shared'
import EmailTemplateContent from './EmailTemplateContent'

const EmailTemplatesContainer = styled.div`
  display: flex;
  padding: 8px;
`

const TitleList = styled.div`
  flex: 0 0 30%;
  max-height: 90vh;
  overflow-y: auto;
  padding-right: 20px;
`

const TitleItem = styled.div`
  background-color: ${({ active }) => (active ? '#f0f0f0' : 'transparent')};
  cursor: pointer;
  padding: 8px 15px 15px 15px;
`

const EmailTemplateDescription = styled.p`
  color: ${th('colorPrimary')};
  font-family: ${th('fontReading')};
  font-size: ${th('fontSizeHeading6')};
  padding: 8px 15px 15px 15px;
  text-transform: uppercase;
`

const EmailTemplates = ({ emailTemplates }) => {
  const [activeTitle, setActiveTitle] = useState('')
  const [activeTemplate, setActiveTemplate] = useState(null)

  const handleTabClick = title => {
    const selectedTemplate = emailTemplates.find(
      template => template.emailContent.description === title,
    )

    setActiveTitle(title)
    setActiveTemplate(selectedTemplate)
  }

  useEffect(() => {
    if (!activeTemplate && emailTemplates.length > 0) {
      setActiveTitle(emailTemplates[0].emailContent.description)
      setActiveTemplate(emailTemplates[0])
    }
  }, [emailTemplates, activeTemplate])

  return (
    <Container>
      <Heading>Email Templates</Heading>
      <WidthLimiter>
        <SectionContent>
          <EmailTemplatesContainer>
            <TitleList>
              <EmailTemplateDescription>
                Email Template Description
              </EmailTemplateDescription>
              {emailTemplates.map(template => (
                <TitleItem
                  active={template.emailContent.description === activeTitle}
                  key={template.id}
                  onClick={() =>
                    handleTabClick(template.emailContent.description)
                  }
                >
                  {template.emailContent.description}
                </TitleItem>
              ))}
            </TitleList>
            {activeTemplate && (
              <EmailTemplateContent activeTemplate={activeTemplate} />
            )}
          </EmailTemplatesContainer>
        </SectionContent>
      </WidthLimiter>
    </Container>
  )
}

export default EmailTemplates
