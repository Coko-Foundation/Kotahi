/* eslint-disable jsx-a11y/label-has-associated-control */

import React, { useCallback } from 'react'
import { Button } from '@pubsweet/ui'
import gql from 'graphql-tag'
import { useQuery, useMutation } from '@apollo/client'
import { useDropzone } from 'react-dropzone'
import styled from 'styled-components'
import Modal from '../../component-modal/src/ConfirmationModal'
import { version as kotahiVersion } from '../../../../package.json'

import {
  Spinner,
  Container,
  SectionHeader,
  SectionContent,
  HeadingWithAction,
  SectionRow,
  Heading,
  Title,
  CommsErrorBanner,
} from '../../shared'
import ChangeUsername from './ChangeUsername'
import { BigProfileImage } from './ProfileImage'
import ChangeEmail from './ChangeEmail'
import EnterEmail from './EnterEmail'

const GET_CURRENT_USER = gql`
  query currentUser {
    currentUser {
      id
      profilePicture
      username
      email
      admin
      defaultIdentity {
        identifier
        email
        type
        aff
        id
      }
      isOnline
    }
  }
`

const GET_OTHER_USER = gql`
  query user($id: ID, $username: String) {
    currentUser {
      id
      profilePicture
      username
      email
      admin
      defaultIdentity {
        identifier
        email
        type
        aff
        id
      }
      isOnline
    }
    user(id: $id, username: $username) {
      id
      username
      profilePicture
      isOnline
      email
      admin
      defaultIdentity {
        identifier
        email
        type
        aff
        id
      }
    }
  }
`

const UPDATE_CURRENT_EMAIL = gql`
  mutation updateCurrentEmail($email: String) {
    updateCurrentEmail(email: $email) {
      success
      error
      user {
        id
        email
      }
    }
  }
`

const UPDATE_CURRENT_USERNAME = gql`
  mutation updateCurrentUsername($username: String) {
    updateCurrentUsername(username: $username) {
      id
      username
    }
  }
`

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

// eslint-disable-next-line react/prop-types
const ProfileDropzone = ({ profilePicture, updateProfilePicture }) => {
  const onDrop = useCallback(async acceptedFiles => {
    const body = new FormData()
    body.append('file', acceptedFiles[0])

    // eslint-disable-next-line no-unused-vars, prefer-const
    let result = await fetch('/api/uploadProfile', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body,
    })

    updateProfilePicture()
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

  return (
    <div {...getRootProps()}>
      <input {...getInputProps()} />
      {profilePicture ? (
        <BigProfileImage src={profilePicture} />
      ) : (
        <BigProfileImage src="/profiles/default_avatar.svg" />
      )}
      {isDragActive ? <Button>Drop it here</Button> : <Button>Change</Button>}
    </div>
  )
}

const Profile = ({ match }) => {
  const { id } = match.params

  const { loading, error, data, client, refetch } = useQuery(
    id ? GET_OTHER_USER : GET_CURRENT_USER,
    id
      ? { variables: { id }, fetchPolicy: 'network-only' }
      : { fetchPolicy: 'network-only' },
  )

  // Mutations and Queries
  const [updateUserEmail] = useMutation(UPDATE_CURRENT_EMAIL)
  const [updateCurrentUsername] = useMutation(UPDATE_CURRENT_USERNAME)

  if (loading) return <Spinner />
  if (error) return <CommsErrorBanner error={error} />

  const localStorage = window.localStorage || undefined

  const logoutUser = () => {
    localStorage.removeItem('token')
    client.resetStore()
  }

  // This is a bridge between the fetch results and the Apollo cache/state
  const updateProfilePicture = () => refetch()

  const user = data.user ?? data.currentUser
  const isCurrentUsersOwnProfile = user.id === data.currentUser.id
  const canEditProfile = isCurrentUsersOwnProfile || data.currentUser.admin
  return (
    <ProfileContainer>
      <Modal isOpen={canEditProfile && !user.email}>
        <EnterEmail updateUserEmail={updateUserEmail} />
      </Modal>
      <div>
        <HeadingWithAction>
          <Heading>Your profile</Heading>
          <Button onClick={() => logoutUser()} primary>
            Logout
          </Button>
        </HeadingWithAction>

        <SectionContent>
          <SectionHeader>
            <Title>Profile picture</Title>
          </SectionHeader>
          <SectionRow key="profilepicture">
            <div>
              {canEditProfile ? (
                <ProfileDropzone
                  profilePicture={user.profilePicture}
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
                <ChangeUsername
                  updateCurrentUsername={updateCurrentUsername}
                  user={user}
                />
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
      </div>

      <VersionText>
        <span>{kotahiVersion}</span>
      </VersionText>
    </ProfileContainer>
  )
}

export default Profile
