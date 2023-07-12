/* eslint-disable jsx-a11y/label-has-associated-control */

import React, { useCallback, useState, useEffect } from 'react'
import { Button, Checkbox } from '@pubsweet/ui'
import { useDropzone } from 'react-dropzone'
import styled from 'styled-components'
import { th, grid } from '@pubsweet/ui-toolkit'
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
        {isDragActive ? 'Drop it here' : 'Change profile picture'}
      </Button>
    </div>
  )
}

const SpecialRoles = ({ user, isCurrentUsersOwnProfile }) => {
  const specialRoles = user.globalRoles
    .concat(user.groupRoles)
    .map(convertCamelCaseToTitleCase)

  if (!specialRoles.length)
    return isCurrentUsersOwnProfile ? (
      <UserPrivilegeAlert>
        User Privileges Required
        <br /> Please ensure that you have the appropriate role permissions or
        contact your system administrator for assistance.
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
  updateEventNotificationsOptIn,
  user,
}) => {
  const [isEventNotificationsOptIn, setEventNotificationsOptIn] = useState(
    user?.eventNotificationsOptIn,
  )

  useEffect(() => {
    if (user) {
      setEventNotificationsOptIn(user.eventNotificationsOptIn)
    }
  }, [user])

  const isCurrentUsersOwnProfile = user.id === currentUser.id

  const canEditProfile =
    isCurrentUsersOwnProfile ||
    currentUser.groupRoles.includes('groupManager') ||
    currentUser.globalRoles.includes('admin')

  const toggleEventNotificationsCheckbox = async () => {
    const newEventNotificationsPreference = !isEventNotificationsOptIn
    setEventNotificationsOptIn(newEventNotificationsPreference)

    await updateEventNotificationsOptIn({
      variables: {
        id: user.id,
        eventNotificationsOptIn: newEventNotificationsPreference,
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
              ? 'Your profile'
              : `Profile: ${user.username}`}
          </Heading>
          {isCurrentUsersOwnProfile && (
            <Button onClick={() => logoutUser()} primary>
              Logout
            </Button>
          )}
        </HeadingWithAction>

        <SpecialRoles
          isCurrentUsersOwnProfile={isCurrentUsersOwnProfile}
          user={user}
        />

        <SectionContent>
          <SectionRow key="profilepicture">
            <div>
              {canEditProfile && isCurrentUsersOwnProfile ? (
                <ProfileDropzone
                  profilePicture={user.profilePicture}
                  replaceAvatarImage={replaceAvatarImage}
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
            <label>ORCID</label> <div>{user.defaultIdentity.identifier}</div>
          </SectionRow>
          <SectionRow>
            <label htmlFor="2">Username</label>
            <div>
              {canEditProfile ? (
                <ChangeUsername updateUsername={updateUsername} user={user} />
              ) : (
                <div>{user.username}</div>
              )}
            </div>
          </SectionRow>
          <SectionRow>
            <label>Email</label>
            <div>
              {canEditProfile ? (
                <ChangeEmail updateUserEmail={updateUserEmail} user={user} />
              ) : (
                <div>{user.email}</div>
              )}
            </div>
          </SectionRow>
        </SectionContent>
        <SectionContent>
          <StyledCheckbox
            checked={!isEventNotificationsOptIn}
            label="Mute all discussion email notifications"
            onChange={toggleEventNotificationsCheckbox}
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
