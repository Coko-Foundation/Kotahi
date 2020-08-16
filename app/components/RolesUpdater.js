import React, { useCallback } from 'react'
import { useQuery } from '@apollo/client'
import { Redirect } from 'react-router-dom'
import { GET_CURRENT_USER } from '../queries'
import currentRolesVar from '../shared/currentRolesVar'

const updateStuff = data => {
  if (data?.currentUser) {
    return currentRolesVar(data.currentUser._currentRoles)
  }
}

const RolesUpdater = ({ children, history, match }) => {
  // This updates the current roles app-wide using Apollo's makeVar
  const { error } = useQuery(GET_CURRENT_USER, {
    pollInterval: 5000,
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'network-only',
    // TODO: useCallback used because of bug: https://github.com/apollographql/apollo-client/issues/6301
    onCompleted: useCallback(data => updateStuff(data), []),
  })

  if (error && !error.networkError) {
    return <Redirect to="/login" />
  }

  return null
}

export default RolesUpdater
