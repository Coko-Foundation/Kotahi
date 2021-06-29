import React, { useCallback } from 'react'
import { useQuery } from '@apollo/client'
import { Redirect } from 'react-router-dom'
import { GET_CURRENT_USER } from '../queries'
import currentRolesVar from '../shared/currentRolesVar'

const updateStuff = data => {
  if (data?.currentUser) {
    // eslint-disable-next-line no-underscore-dangle
    return currentRolesVar(data.currentUser._currentRoles)
  }

  return null
}

const RolesUpdater = ({ children }) => {
  // This updates the current roles app-wide using Apollo's makeVar
  const { data, error, loading } = useQuery(GET_CURRENT_USER, {
    // pollInterval: 5000,
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'network-only',
    // TODO: useCallback used because of bug: https://github.com/apollographql/apollo-client/issues/6301
    onCompleted: useCallback(dataCompleted => updateStuff(dataCompleted), []),
  })

  if ((error && !error.networkError) || (!loading && !data?.currentUser)) {
    return <Redirect to="/login" />
  }

  return null
}

export default RolesUpdater
