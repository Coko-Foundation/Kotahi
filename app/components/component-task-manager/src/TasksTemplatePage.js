import React from 'react'
import { useMutation, useQuery, gql } from '@apollo/client'
import { UPDATE_TASK, UPDATE_TASKS } from '../../../queries'
import { CommsErrorBanner, Spinner } from '../../shared'
import TasksTemplate from './TasksTemplate'

const query = gql`
  query getTasksQuery {
    tasks(manuscriptId: null) {
      id
      created
      updated
      manuscriptId
      title
      assigneeUserId
      assignee {
        id
        username
        email
        profilePicture
      }
      defaultDurationDays
      dueDate
      reminderPeriodDays
      status
      isComplete
    }

    users {
      id
      username
      email
      profilePicture
    }
  }
`

const TasksTemplatePage = ({ match, ...props }) => {
  const [updateTask] = useMutation(UPDATE_TASK, {
    refetchQueries: ['getTasksQuery'],
  })

  const [updateTasks] = useMutation(UPDATE_TASKS, {
    refetchQueries: ['getTasksQuery'],
  })

  const { loading, error, data } = useQuery(query)
  if (loading && !data) return <Spinner />
  if (error) return <CommsErrorBanner error={error} />

  return (
    <TasksTemplate
      tasks={data.tasks}
      updateTask={updateTask}
      updateTasks={updateTasks}
      users={data.users}
    />
  )
}

export default TasksTemplatePage
