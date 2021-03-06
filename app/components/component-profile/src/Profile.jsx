import React, { useCallback } from 'react'
import { Button } from '@pubsweet/ui'
import gql from 'graphql-tag'
import { useQuery } from '@apollo/client'
import { useDropzone } from 'react-dropzone'

import {
  Spinner,
  Container,
  SectionHeader,
  SectionContent,
  HeadingWithAction,
  SectionRow,
  Heading,
  Title,
} from '../../shared'
import ChangeUsername from './ChangeUsername'
import { BigProfileImage } from './ProfileImage'

const GET_CURRENT_USER = gql`
  query currentUser {
    currentUser {
      id
      profilePicture
      username
      defaultIdentity {
        identifier
        email
        type
        aff
        id
        name
      }
    }
  }
`

// eslint-disable-next-line react/prop-types
const ProfileDropzone = ({ profilePicture, updateProfilePicture }) => {
  const onDrop = useCallback(async acceptedFiles => {
    const body = new FormData()
    body.append('file', acceptedFiles[0])
    let result = await fetch('/api/uploadProfile', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body,
    })
    result = await result.text()
    updateProfilePicture(result)
  }, [])
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

  return (
    <div {...getRootProps()}>
      <input {...getInputProps()} />
      {profilePicture ? (
        <BigProfileImage src={profilePicture} />
      ) : (
        <BigProfileImage src="/static/profiles/placeholder.png" />
      )}
      {isDragActive ? <Button>Drop it here</Button> : <Button>Change</Button>}
    </div>
  )
}

const Profile = () => {
  const { loading, error, data, client } = useQuery(GET_CURRENT_USER)

  if (loading) return <Spinner />
  if (error) return JSON.stringify(error)

  const localStorage = window.localStorage || undefined

  const logoutUser = () => {
    localStorage.removeItem('token')
    client.resetStore()
  }

  // This is a bridge between the fetch results and the Apollo cache/state
  const updateProfilePicture = profilePicture => {
    const cacheData = client.readQuery({ query: GET_CURRENT_USER })
    const updatedData = {
      currentUser: {
        ...cacheData.currentUser,
        profilePicture,
      },
    }
    client.writeData({ data: updatedData })
  }

  return (
    <Container>
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
            <ChangeUsername user={data.currentUser} />
          </div>
        </SectionRow>
      </SectionContent>
    </Container>
  )
}

export default Profile
