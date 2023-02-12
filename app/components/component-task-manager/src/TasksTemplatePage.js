import React from 'react'
import { useMutation, useQuery, gql } from '@apollo/client'
import {
  DELETE_TASK_NOTIFICATION,
  UPDATE_TASK,
  UPDATE_TASKS,
  UPDATE_TASK_NOTIFICATION,
} from '../../../queries'
import { CommsErrorBanner, Spinner } from '../../shared'
import TasksTemplate from './TasksTemplate'
import { roles } from '../../../globals'

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
      emailNotifications {
        id
        taskId
        recipientUserId
        recipientType
        notificationElapsedDays
        emailTemplateKey
        recipientName
        recipientEmail
        recipientUser {
          id
          username
          email
        }
      }
      notificationLogs {
        id
        taskId
        senderEmail
        recipientEmail
        emailTemplateKey
        content
        updated
        created
      }
      assigneeType
      assigneeEmail
      assigneeName
      defaultDurationDays
      dueDate
      reminderPeriodDays
      status
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

  const [updateTaskNotification] = useMutation(UPDATE_TASK_NOTIFICATION, {
    refetchQueries: ['getTasksQuery'],
  })

  const [deleteTaskNotification] = useMutation(DELETE_TASK_NOTIFICATION, {
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
      deleteTaskNotification={deleteTaskNotification}
      roles={roles}
      tasks={data.tasks}
      updateTask={updateTask}
      updateTaskNotification={updateTaskNotification}
      updateTasks={updateTasks}
      users={data.users}
    />
  )
}

export default TasksTemplatePage
