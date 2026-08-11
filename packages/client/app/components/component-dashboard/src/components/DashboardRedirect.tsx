import { type ReactNode } from 'react'
import { useParams, Navigate } from 'react-router-dom'

import { useCurrentUser } from '../../../../pages/hooks/useCurrentUser'

const DashboardRedirect = (): ReactNode => {
  const { groupName } = useParams()
  const currentUser = useCurrentUser()

  const invitationId = window.localStorage.getItem('invitationId') || ''
  const inviteAction = window.localStorage.getItem('inviteAction') || ''

  const dashboardSubmissionsLink = `/${groupName}/dashboard/submissions`

  // @ts-ignore
  const dashboardRedirectUrl = currentUser?.recentTab
    ? // @ts-ignore
      `/${groupName}/dashboard/${currentUser.recentTab}`
    : dashboardSubmissionsLink

  if (invitationId) {
    return (
      <Navigate
        replace
        to={`/${groupName}/${
          inviteAction === 'decline'
            ? 'decline/'.concat(invitationId)
            : 'invitation/accepted'
        }`}
      />
    )
  }

  return <Navigate replace to={dashboardRedirectUrl} />
}

export default DashboardRedirect
