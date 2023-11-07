import React from 'react'
import styled from 'styled-components'
import { grid } from '@pubsweet/ui-toolkit'
import { useTranslation } from 'react-i18next'
import { RoundIconButton } from '../../shared'
import EmailTemplateContent from './EmailTemplateContent'

import {
  Heading2,
  SidebarPageRow,
  RightArrow,
  EditPageContainer,
  EditPageLeft,
  EditPageRight,
} from '../../component-cms-manager/src/style'

import PageHeader from '../../component-cms-manager/src/components/PageHeader'

const AddNewEmailTemplate = styled(RoundIconButton)`
  margin-left: ${grid(1)};
  margin-top: ${grid(2)};
  min-width: 0px;
`

const EmailTemplates = ({
  emailTemplates,
  onNewItemButtonClick,
  activeTemplate,
  isNewEmailTemplate,
  createEmailTemplate,
  deleteEmailTemplate,
  showEmailTemplate,
  onItemClick,
  updateEmailTemplate,
}) => {
  const { t } = useTranslation()
  return (
    <EditPageContainer>
      <EditPageLeft>
        <div>
          {emailTemplates.map(template => (
            <SidebarPageRow key={template.id}>
              <Heading2 onClick={() => onItemClick(template)}>
                {template.emailContent.description}
              </Heading2>
              {template.id === activeTemplate?.id ? <RightArrow /> : null}
            </SidebarPageRow>
          ))}
        </div>
        <AddNewEmailTemplate
          disabled={isNewEmailTemplate}
          iconName="Plus"
          onClick={onNewItemButtonClick}
          primary
          title={t('emailTemplate.addANewEmailTemplate')}
        />
      </EditPageLeft>
      <EditPageRight>
        <PageHeader
          leftSideOnly
          mainHeading={
            isNewEmailTemplate
              ? t('emailTemplate.New Email Template')
              : t('emailTemplate.Email Templates')
          }
        />
        {activeTemplate && (
          <EmailTemplateContent
            activeTemplate={activeTemplate}
            createEmailTemplate={createEmailTemplate}
            deleteEmailTemplate={deleteEmailTemplate}
            emailTemplates={emailTemplates}
            isNewEmailTemplate={isNewEmailTemplate}
            showEmailTemplate={showEmailTemplate}
            updateEmailTemplate={updateEmailTemplate}
          />
        )}
      </EditPageRight>
    </EditPageContainer>
  )
}

export default EmailTemplates
