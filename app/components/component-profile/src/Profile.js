/* eslint-disable jsx-a11y/label-has-associated-control */

import React, { useCallback, useState, useEffect } from 'react'
import { Button, Checkbox } from '@pubsweet/ui'
import { useDropzone } from 'react-dropzone'
import styled from 'styled-components'
import { th, grid } from '@pubsweet/ui-toolkit'
import { useTranslation } from 'react-i18next'
import i18next from 'i18next'
import Modal from '../../component-modal/src/ConfirmationModal'
import { convertCamelCaseToTitleCase } from '../../../shared/textUtils'

import {
  Container,
  SectionContent,
  HeadingWithAction,
  SectionRow,
  Heading,
} from '../../shared'
import ChangeUsername from './ChangeUsername'
import { BigProfileImage } from './ProfileImage'
import ChangeEmail from './ChangeEmail'
import EnterEmail from './EnterEmail'
import ChangeLanguage from './ChangeLanguage'
import { languagesLabels } from '../../../i18n/index'

const VersionText = styled.div`
  color: #757575;
  display: flex;
  justify-content: flex-end;
`

const ProfileContainer = styled(Container)`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`

const StyledCheckbox = styled(Checkbox)`
  padding: ${grid(2)} ${grid(3)};
`

const SpecialRolesLabel = styled.div`
  color: ${th('colorPrimary')};
`

const UserPrivilegeAlert = styled.div`
  background: ${th('colorWarningLight')};
  border-left: 3px solid ${th('colorWarning')};
  color: ${th('colorWarningDark')};
  line-height: 1.8;
  margin-top: 0.5em;
  padding: 0.5em 1em 0.5em 0.5em;
  width: 100%;
`

const ProfileDropzone = ({
  profilePicture,
  replaceAvatarImage,
  updateProfilePicture,
  t,
}) => {
  const onDrop = useCallback(async acceptedFiles => {
    await replaceAvatarImage(acceptedFiles)
    updateProfilePicture()
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

  return (
    <div {...getRootProps()}>
      <input {...getInputProps()} />
      <BigProfileImage src={profilePicture || '/profiles/default_avatar.svg'} />
      <Button>
        {isDragActive
          ? t('profilePage.Drop it here')
          : t('profilePage.Change profile picture')}
      </Button>
    </div>
  )
}

const SpecialRoles = ({ user, isCurrentUsersOwnProfile, t }) => {
  let specialRoles = user.globalRoles
    .concat(user.groupRoles)
    .map(convertCamelCaseToTitleCase)

  specialRoles = specialRoles.map(elem => {
    return t(`common.roles.${elem}`)
  })

  if (!specialRoles.length)
    return isCurrentUsersOwnProfile ? (
      <UserPrivilegeAlert>
        {t('profilePage.userPrivilegeAlert')}
      </UserPrivilegeAlert>
    ) : null

  return <SpecialRolesLabel>({specialRoles.join(', ')})</SpecialRolesLabel>
}

const Profile = ({
  currentUser,
  kotahiVersion,
  logoutUser,
  match,
  replaceAvatarImage,
  updateProfilePicture,
  updateUserEmail,
  updateUsername,
  updateLanguage,
  updateGlobalChatNotificationOptIn,
  user,
  notificationUserOption,
}) => {
  const [
    hasGlobalChatNotificationOptIn,
    setHasGlobalChatNotificationOptIn,
  ] = useState(notificationUserOption)

  const { t } = useTranslation()
  useEffect(() => {
    if (notificationUserOption) {
      setHasGlobalChatNotificationOptIn(notificationUserOption)
    }
  }, [notificationUserOption])
  const isCurrentUsersOwnProfile = user.id === currentUser.id

  const canEditProfile =
    isCurrentUsersOwnProfile ||
    currentUser.groupRoles.includes('groupManager') ||
    currentUser.globalRoles.includes('admin')

  const toggleGlobalChatNotificationOptIn = async () => {
    const updatedGlobalChatNotificationOptIn =
      hasGlobalChatNotificationOptIn === 'off' ? 'inherit' : 'off'

    setHasGlobalChatNotificationOptIn(updatedGlobalChatNotificationOptIn)

    await updateGlobalChatNotificationOptIn({
      variables: {
        option: updatedGlobalChatNotificationOptIn,
      },
    })
  }

  return (
    <ProfileContainer>
      <Modal isOpen={canEditProfile && !user.email}>
        <EnterEmail updateUserEmail={updateUserEmail} user={user} />
      </Modal>
      <div>
        <HeadingWithAction>
          <Heading>
            {isCurrentUsersOwnProfile
              ? t('profilePage.Your profile')
              : t('profilePage.Profile: ') + user.username}
          </Heading>
          {isCurrentUsersOwnProfile && (
            <Button onClick={() => logoutUser()} primary>
              {t('profilePage.Logout')}
            </Button>
          )}
        </HeadingWithAction>

        <SpecialRoles
          isCurrentUsersOwnProfile={isCurrentUsersOwnProfile}
          t={t}
          user={user}
        />

        <SectionContent>
          <SectionRow key="profilepicture">
            <div>
              {canEditProfile && isCurrentUsersOwnProfile ? (
                <ProfileDropzone
                  profilePicture={user.profilePicture}
                  replaceAvatarImage={replaceAvatarImage}
                  t={t}
                  updateProfilePicture={updateProfilePicture}
                />
              ) : (
                <BigProfileImage
                  src={
                    user.profilePicture === null
                      ? '/profiles/default_avatar.svg'
                      : user.profilePicture
                  }
                />
              )}
            </div>
          </SectionRow>
          <SectionRow>
            <label>{t('profilePage.ORCID')}</label>{' '}
            <div>{user.defaultIdentity.identifier}</div>
          </SectionRow>
          <SectionRow>
            <label htmlFor="2">{t('profilePage.Username')}</label>
            <div>
              {canEditProfile ? (
                <ChangeUsername updateUsername={updateUsername} user={user} />
              ) : (
                <div>{user.username}</div>
              )}
            </div>
          </SectionRow>
          <SectionRow>
            <label>{t('profilePage.Email')}</label>
            <div>
              {canEditProfile ? (
                <ChangeEmail updateUserEmail={updateUserEmail} user={user} />
              ) : (
                <div>{user.email}</div>
              )}
            </div>
          </SectionRow>
          <SectionRow>
            <label>{t('profilePage.Language')}</label>
            <div>
              {canEditProfile ? (
                <ChangeLanguage updateLanguage={updateLanguage} user={user} />
              ) : (
                <div>
                  {
                    languagesLabels.find(
                      elem => elem.value === i18next.language,
                    ).label
                  }
                </div>
              )}
            </div>
          </SectionRow>
        </SectionContent>
        <SectionContent>
          <StyledCheckbox
            checked={hasGlobalChatNotificationOptIn === 'off'}
            label={t('profilePage.Mute all discussion email notifications')}
            onChange={toggleGlobalChatNotificationOptIn}
          />
        </SectionContent>
      </div>

      <VersionText>
        <span>{kotahiVersion}</span>
      </VersionText>
    </ProfileContainer>
  )
}

export default Profile
