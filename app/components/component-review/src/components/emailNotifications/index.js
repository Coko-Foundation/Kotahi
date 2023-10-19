import React, { useState, useContext } from 'react'
import { th } from '@pubsweet/ui-toolkit'
import styled, { css } from 'styled-components'
import { useTranslation } from 'react-i18next'
import { SectionHeader, SectionRowGrid, Title } from '../style'
import { SectionContent } from '../../../../shared'
import SelectReceiver from './SelectReceiver'
import SelectEmailTemplate from './SelectEmailTemplate'
import ActionButton from '../../../../shared/ActionButton'
import { sendEmail, sendEmailChannelMessage } from './emailUtils'
import { ConfigContext } from '../../../../config/src'

const UserEmailWrapper = styled.div`
  font-size: ${th('fontSizeBaseSmall')};
  line-height: ${th('lineHeightBaseSmall')};
`

const editorOption = user => ({
  label: (
    <>
      <div>{user.username}</div>{' '}
      <UserEmailWrapper>{user.email}</UserEmailWrapper>{' '}
    </>
  ),
  value: user.email,
  userName: user.username,
})

export const EmailErrorMessageWrapper = styled.div`
  color: ${th('colorError')};
  font-family: ${th('fontInterface')};
  font-size: ${th('fontSizeBaseSmall')};
  line-height: ${th('lineHeightBaseSmall')};

  ${props =>
    props.isVisible === true
      ? css`
          display: flex;
        `
      : css`
          display: none;
        `}

  padding: calc(8px * 2) calc(8px * 3);

  &:not(:last-child) {
    margin-bottom: ${th('gridUnit')};
  }
`

const RowGridStyled = styled(SectionRowGrid)`
  grid-template-columns: repeat(5, minmax(0, 1fr));
`

const EmailNotifications = ({
  manuscript,
  allUsers,
  currentUser,
  sendNotifyEmail,
  sendChannelMessage,
  selectedEmail,
  externalEmail,
  setSelectedEmail,
  setExternalEmail,
  selectedEmailIsBlacklisted,
  emailTemplates,
}) => {
  const config = useContext(ConfigContext)
  const [externalName, setExternalName] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [isNewUser, setIsNewUser] = useState(false)
  const [notificationStatus, setNotificationStatus] = useState(null)
  const { t } = useTranslation()

  const resetAll = () => {
    setExternalEmail('')
    setSelectedEmail('')
    setExternalName('')
    setSelectedTemplate('')
  }

  const handlerForNewUserToggle = () => {
    resetAll()
    setIsNewUser(s => !s)
  }

  const options = (allUsers || [])
    .filter(user => user.email)
    .map(user => editorOption(user))

  return (
    <SectionContent>
      <SectionHeader>
        <Title>{t('decisionPage.tasksTab.Notifications')}</Title>
      </SectionHeader>
      <RowGridStyled>
        <SelectReceiver
          externalEmail={externalEmail}
          externalName={externalName}
          isNewUser={isNewUser}
          onChangeReceiver={setSelectedEmail}
          options={options}
          selectedReceiver={selectedEmail}
          setExternalEmail={setExternalEmail}
          setExternalName={setExternalName}
          setIsNewUser={handlerForNewUserToggle}
        />
        <SelectEmailTemplate
          emailTemplates={emailTemplates}
          onChangeEmailTemplate={setSelectedTemplate}
          selectedEmailTemplate={selectedTemplate}
        />
        <ActionButton
          onClick={async () => {
            setNotificationStatus('pending')

            const output = await sendEmail(
              manuscript,
              isNewUser,
              currentUser,
              sendNotifyEmail,
              selectedTemplate,
              selectedEmail,
              externalEmail,
              externalName,
              selectedEmailIsBlacklisted,
              config.groupId,
            )

            if (!output?.emailStatus) {
              setNotificationStatus('failure')
              return
            }

            const { invitation, input } = output

            setNotificationStatus(invitation ? 'success' : 'failure')

            if (input) {
              sendEmailChannelMessage(
                sendChannelMessage,
                currentUser,
                input,
                options,
                emailTemplates,
              )
            }
          }}
          primary
          status={notificationStatus}
        >
          {t('decisionPage.tasksTab.Notify')}
        </ActionButton>
      </RowGridStyled>
      <EmailErrorMessageWrapper isVisible={selectedEmailIsBlacklisted}>
        {t('decisionPage.tasksTab.User email address opted out')}
      </EmailErrorMessageWrapper>
    </SectionContent>
  )
}

export default EmailNotifications
