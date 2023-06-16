import React from 'react'
import gql from 'graphql-tag'
import { useQuery, useMutation } from '@apollo/client'
import Profile from './Profile'
import { Spinner, CommsErrorBanner } from '../../shared'
import { version as kotahiVersion } from '../../../../package.json'

const GET_USER = gql`
  query user($id: ID, $username: String) {
    user(id: $id, username: $username) {
      id
      username
      profilePicture
      isOnline
      email
      globalRoles
      groupRoles
      eventNotificationsOptIn
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

const UPDATE_EMAIL = gql`
  mutation updateEmail($id: ID!, $email: String!) {
    updateEmail(id: $id, email: $email) {
      success
      error
      user {
        id
        email
      }
    }
  }
`

const UPDATE_USERNAME = gql`
  mutation updateUsername($id: ID!, $username: String!) {
    updateUsername(id: $id, username: $username) {
      id
      username
    }
  }
`

const UPDATE_USER_NOTIFICATION_PREFERENCE = gql`
  mutation updateEventNotificationsOptIn(
    $id: ID!
    $eventNotificationsOptIn: Boolean!
  ) {
    updateEventNotificationsOptIn(
      id: $id
      event_notifications_opt_in: $eventNotificationsOptIn
    ) {
      id
      eventNotificationsOptIn
    }
  }
`

const ProfilePage = ({ currentUser, match }) => {
  const replaceAvatarImage = async acceptedFiles => {
    const body = new FormData()
    body.append('file', acceptedFiles[0])

    await fetch('/api/uploadProfile', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body,
    })
  }

  const { id } = match.params

  const { loading, error, data, client, refetch } = useQuery(GET_USER, {
    variables: { id: id || currentUser.id },
    fetchPolicy: 'network-only',
  })

  // Mutations and Queries
  const [updateUserEmail] = useMutation(UPDATE_EMAIL)
  const [updateUsername] = useMutation(UPDATE_USERNAME)

  const [updateEventNotificationsOptIn] = useMutation(
    UPDATE_USER_NOTIFICATION_PREFERENCE,
  )

  if (loading) return <Spinner />
  if (error) return <CommsErrorBanner error={error} />

  const localStorage = window.localStorage || undefined

  const logoutUser = () => {
    localStorage.removeItem('token')
    client.resetStore()
  }

  // This is a bridge between the fetch results and the Apollo cache/state
  const updateProfilePicture = () => refetch()

  const { user } = data

  return (
    <Profile
      currentUser={currentUser}
      kotahiVersion={kotahiVersion}
      logoutUser={logoutUser}
      match={match}
      replaceAvatarImage={replaceAvatarImage}
      updateEventNotificationsOptIn={updateEventNotificationsOptIn}
      updateProfilePicture={updateProfilePicture}
      updateUserEmail={updateUserEmail}
      updateUsername={updateUsername}
      user={user}
    />
  )
}

export default ProfilePage
