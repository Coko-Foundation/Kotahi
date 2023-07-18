import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import EmailTemplateContent from './EmailTemplateContent'

import { Heading2, RightArrow } from '../../component-cms-manager/src/style'

import PageHeader from '../../component-cms-manager/src/components/PageHeader'

const EmailTemplatePageContainer = styled.div`
  display: flex;
`

const EmailTemplateLeftSection = styled.div`
  height: 100vh;
  min-width: 300px;
  overflow: scroll;
  padding-top: 16px;
`

const EmailTemplateRightSection = styled.div`
  background-color: #f4f5f7;
  flex-grow: 1;
  height: 100vh;
  padding-left: 16px;
  padding-top: 16px;
`

export const EmailTemplateSidebar = styled.div`
  border-bottom: 1px solid #dedede;
  display: flex;
  justify-content: space-between;
  margin-left: 16px;
  margin-right: 16px;
  padding: 12px 0px;
  width: 250px;

  div {
    padding: 0px;
  }
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
    <EmailTemplatePageContainer>
      <EmailTemplateLeftSection>
        <div>
          {emailTemplates.map(template => (
            <EmailTemplateSidebar key={template.id}>
              <Heading2
                onClick={() =>
                  handleTabClick(template.emailContent.description)
                }
              >
                {template.emailContent.description}
              </Heading2>
              {template.emailContent.description === activeTitle ? (
                <RightArrow />
              ) : null}
            </EmailTemplateSidebar>
          ))}
        </div>
      </EmailTemplateLeftSection>
      <EmailTemplateRightSection>
        <PageHeader leftSideOnly mainHeading="Email Templates" />
        {activeTemplate && (
          <EmailTemplateContent activeTemplate={activeTemplate} />
        )}
      </EmailTemplateRightSection>
    </EmailTemplatePageContainer>
  )
}

export default EmailTemplates
