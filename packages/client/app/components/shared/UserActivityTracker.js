import React, { useEffect, useCallback } from 'react'
import { throttle } from 'lodash'

/* eslint-disable-next-line react/function-component-definition */
function UserActivityTracker({ reportUserIsActive, children }) {
  const throttledReportUserIsActive = useCallback(
    throttle(reportUserIsActive, 60000, { leading: true }),
    [],
  )

  useEffect(() => {
    const listener = throttledReportUserIsActive
    window.addEventListener('mousemove', listener, true)
    window.addEventListener('keydown', listener, true)

    return () => {
      window.removeEventListener('mousemove', listener, true)
      window.removeEventListener('keydown', listener, true)
      reportUserIsActive()
    }
  }, [])

  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{children}</>
}

export default UserActivityTracker
