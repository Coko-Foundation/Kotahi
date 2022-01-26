/* eslint-disable jsx-a11y/label-has-associated-control */

import React, { useCallback } from 'react'
import { Button } from '@pubsweet/ui'
import gql from 'graphql-tag'
import { useQuery, useMutation } from '@apollo/client'
import { useDropzone } from 'react-dropzone'
import Modal from '../../component-modal/src/index'

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

const Profile = () => {
  const { loading, error, data, client, refetch } = useQuery(GET_CURRENT_USER)

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

  return (
    <Container>
      <Modal isOpen={!data.currentUser.email}>
        <EnterEmail updateUserEmail={updateUserEmail} user={data.currentUser} />
      </Modal>
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
            <ProfileDropzone
              profilePicture={data.currentUser.profilePicture}
              updateProfilePicture={updateProfilePicture}
            />
          </div>
        </SectionRow>
        <SectionRow>
          <label>ORCID</label>{' '}
          <div>{data.currentUser.defaultIdentity.identifier}</div>
        </SectionRow>
        <SectionRow>
          <label htmlFor="2">Username</label>
          <div>
            <ChangeUsername
              updateCurrentUsername={updateCurrentUsername}
              user={data.currentUser}
            />
          </div>
        </SectionRow>
        <SectionRow>
          <label>Email</label>{' '}
          <div>
            <ChangeEmail
              updateUserEmail={updateUserEmail}
              user={data.currentUser}
            />
          </div>
        </SectionRow>
      </SectionContent>
    </Container>
  )
}

export default Profile
