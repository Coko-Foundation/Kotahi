/* eslint-disable react-hooks/exhaustive-deps */

import { useMutation } from '@apollo/client/react'
import { useEffect } from 'react'

import {
  UPDATE_TAB,
  REMOVE_TASK_ALERTS_FOR_CURRENT_USER,
} from '../../../../queries'
import EditorTable from './sections/EditorTable'

const DashboardEditsPage = () => {
  const [updateTab] = useMutation(UPDATE_TAB)

  const [removeTaskAlertsForCurrentUser] = useMutation(
    REMOVE_TASK_ALERTS_FOR_CURRENT_USER,
  )

  useEffect(() => {
    updateTab({
      variables: {
        tab: 'edits',
      },
    })
    removeTaskAlertsForCurrentUser()
  }, [])

  return <EditorTable />
}

export default DashboardEditsPage
