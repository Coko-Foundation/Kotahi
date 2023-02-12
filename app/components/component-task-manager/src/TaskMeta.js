import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { th } from '@pubsweet/ui-toolkit'
import { v4 as uuid } from 'uuid'
import {
  RoundIconButton,
  MediumColumn,
  MinimalNumericUpDown,
  MinimalTextInput,
} from '../../shared'

import TaskNotificationDetails from './TaskNotificationDetails'
import AssigneeDropdown from './AssigneeDropdown'
import DueDateField from './DueDateField'
import { convertTimestampToDateString } from '../../../shared/dateUtils'

const TaskMetaContainer = styled.div`
  width: 100%;
  display: flex;
`

const TitleCell = styled.div`
  display: flex;
`

const DurationDaysCell = styled.div`
  justify-content: flex-start;
  position: relative;
`

const TaskTitleContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 30%;
`

const TaskDetailsContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 70%;
`

const TaskPrimaryDetails = styled.div`
  display: flex;
  width: 100%;
  margin-bottom: 40px;
`

const TaskTitle = styled.div`
  text-transform: uppercase;
  font-size: ${th('fontSizeBaseSmall')};
  font-variant: all-small-caps;
`

const DurationTitle = styled.div`
  text-transform: uppercase;
  font-size: ${th('fontSizeBaseSmall')};
  font-variant: all-small-caps;
`

const TaskFieldsContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 25%;
  margin-right: 20px;
`

// ToDo: Style of Container, Button, Paragraph yet to be updated as per convention
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`

const Button = styled.button`
  padding: 20px 10px;
  background-color: transparent;
  border: none;
  font-size: 12px;
  color: green;
  position: relative;
  text-decoration: underline;
  top: 4px;
  right: -340px;
  font-family: Roboto, -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica,
    Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol',
    sans-serif;
`

const Paragraph = styled.div`
  margin: 10px 0;
  text-align: left;
  font-size: 11px;
  color: green;
  position: relative;
  top: 2px;
  right: -200px;
  line-height: 20px;
  font-family: Roboto, -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica,
    Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol',
    sans-serif;
`

const TaskMeta = ({
  task,
  index,
  updateTask,
  updateTaskNotification: persistTaskNotification,
  assigneeGroupedOptions,
  onCancel,
  onDelete,
  isReadOnly,
  editAsTemplate,
  dueDateLocalString,
  transposedEndOfToday,
  transposedDueDate,
  recipientGroupedOptions,
  deleteTaskNotification,
  displayDefaultDurationDays,
  manuscript,
  currentUser,
  sendNotifyEmail,
  taskNotificationLogs,
  createTaskEmailNotificationLog,
}) => {
  const notificationOptions = [
    {
      label: 'Before',
      value: 'before',
    },
    {
      label: 'After',
      value: 'after',
    },
  ]

  const [taskEmailNotifications, setTaskNotifications] = useState(
    task.emailNotifications ?? [],
  )

  useEffect(() => {
    setTaskNotifications(task.emailNotifications)
  }, [task])

  const repackageTaskNotification = taskNotification => ({
    id: taskNotification.id,
    taskId: taskNotification.taskId,
    recipientUserId: taskNotification.recipientUserId || null,
    recipientType: taskNotification.recipientType || null,
    notificationElapsedDays: taskNotification.notificationElapsedDays || null,
    emailTemplateKey: taskNotification.emailTemplateKey || null,
    recipientName: taskNotification.recipientName || null,
    recipientEmail: taskNotification.recipientEmail || null,
  })

  const updateTaskNotification = async updatedTaskNotification => {
    if (updatedTaskNotification.recipientType) {
      persistTaskNotification({
        variables: {
          taskNotification: repackageTaskNotification({
            ...updatedTaskNotification,
          }),
        },
      })
    }

    setTaskNotifications(
      taskEmailNotifications.map(t =>
        t.id === updatedTaskNotification.id ? updatedTaskNotification : t,
      ),
    )
  }

  const [isToggled, setToggled] = useState(false)

  const addNewTaskNotification = () => {
    setTaskNotifications([
      ...(taskEmailNotifications ?? []),
      {
        id: uuid(),
        taskId: task.id,
        recipientType: null,
      },
    ])
  }

  return (
    <MediumColumn>
      <TaskMetaContainer>
        <TaskTitleContainer>
          <TaskTitle>Title</TaskTitle>
          <TitleCell>
            <MinimalTextInput
              autoFocus={!task.title}
              onCancel={() => {
                if (!task.title) onCancel()
              }}
              onChange={val => updateTask(task.id, { ...task, title: val })}
              value={task.title}
            />
          </TitleCell>
        </TaskTitleContainer>
        <TaskDetailsContainer>
          <TaskPrimaryDetails>
            <TaskFieldsContainer>
              <TaskTitle>Assignee</TaskTitle>
              <AssigneeDropdown
                assigneeGroupedOptions={assigneeGroupedOptions}
                task={task}
                updateTask={updateTask}
              />
            </TaskFieldsContainer>

            {!editAsTemplate && (
              <>
                <TaskFieldsContainer>
                  <DurationTitle>Due Date</DurationTitle>
                  <DueDateField
                    displayDefaultDurationDays={displayDefaultDurationDays}
                    dueDateLocalString={dueDateLocalString}
                    task={task}
                    transposedDueDate={transposedDueDate}
                    transposedEndOfToday={transposedEndOfToday}
                    updateTask={updateTask}
                  />
                </TaskFieldsContainer>
              </>
            )}
            <TaskFieldsContainer>
              <DurationTitle>Duration</DurationTitle>

              <DurationDaysCell>
                <MinimalNumericUpDown
                  onChange={val =>
                    updateTask(task.id, {
                      ...task,
                      defaultDurationDays: val,
                    })
                  }
                  value={task.defaultDurationDays || 0}
                />
              </DurationDaysCell>
            </TaskFieldsContainer>
          </TaskPrimaryDetails>
          {(taskEmailNotifications === null ||
            !taskEmailNotifications?.length) &&
            'Add Notification Recipient'}
          {taskEmailNotifications?.length ? (
            <>
              {taskEmailNotifications.map((notification, key) => (
                <TaskNotificationDetails
                  createTaskEmailNotificationLog={
                    createTaskEmailNotificationLog
                  }
                  currentUser={currentUser}
                  deleteTaskNotification={deleteTaskNotification}
                  editAsTemplate={editAsTemplate}
                  key={notification.id}
                  manuscript={manuscript}
                  notificationOptions={notificationOptions}
                  recipientGroupedOptions={recipientGroupedOptions}
                  sendNotifyEmail={sendNotifyEmail}
                  task={task}
                  taskEmailNotification={notification}
                  updateTaskNotification={updateTaskNotification}
                />
              ))}
            </>
          ) : null}
          {!isReadOnly && (
            <RoundIconButton
              disabled={
                taskEmailNotifications?.length
                  ? taskEmailNotifications.some(t => !t.recipientType)
                  : false
              }
              iconName="Plus"
              onClick={addNewTaskNotification}
              primary
              title="Add a new task"
            />
          )}
          <Container>
            <Button onClick={() => setToggled(!isToggled)}>
              {isToggled
                ? `Hide all notifications sent (${task.notificationLogs.length})`
                : `Show all notifications sent (${task.notificationLogs.length})`}
            </Button>
            {isToggled && (
              <Paragraph>
                {task.notificationLogs.map(log => (
                  <>
                    <div>{convertTimestampToDateString(log.created)}</div>
                    <div>{log.content}</div>
                    <br />
                  </>
                ))}
              </Paragraph>
            )}
          </Container>
        </TaskDetailsContainer>
      </TaskMetaContainer>
    </MediumColumn>
  )
}

TaskMeta.propTypes = {
  task: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    assignee: PropTypes.shape({
      id: PropTypes.string.isRequired,
      username: PropTypes.string.isRequired,
    }),
    dueDate: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string,
      PropTypes.shape({}),
    ]),
    status: PropTypes.string.isRequired,
  }).isRequired,
  index: PropTypes.number.isRequired,
  /** Callback for when a new task is abandoned before receiving a title (e.g. escape was pressed) */
  onCancel: PropTypes.func,
  onDelete: PropTypes.func.isRequired,
  updateTask: PropTypes.func.isRequired,
}
TaskMeta.defaultProps = {
  onCancel: () => {},
}

export default TaskMeta
