import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { th, grid } from '@pubsweet/ui-toolkit'
import { v4 as uuid } from 'uuid'
import {
  RoundIconButton,
  MediumColumn,
  MinimalNumericUpDown,
} from '../../shared'

import TaskNotificationDetails from './TaskNotificationDetails'
import AssigneeDropdown from './AssigneeDropdown'
import DueDateField from './DueDateField'
import TextInput from './TextInput'

const TaskMetaContainer = styled.div`
  width: 100%;
  display: flex;
`

const TitleCell = styled.div`
  display: flex;
  align-items: center;
  background: transparent;
  line-height: 1em;
  min-height: ${grid(6)};
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
  font-family: 'Roboto';
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  line-height: 19px;
  letter-spacing: 0.01em;
  color: #323232;
  margin-bottom: 4px;
`

const TaskFieldsContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: 10px;
  margin-right: 10px;
`

const AssigneeFieldContainer = styled(TaskFieldsContainer)`
  flex: 0 0 7.8em;
`

const DueDateFieldContainer = styled(TaskFieldsContainer)`
  flex: 0 0 7.8em;
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
            <TextInput
              onChange={event => updateTask(task.id, { ...task, title: event.target.value })}
              placeholder="Give your task a name..."
              value={task.title}
              autoFocus={!task.title}
              // onCancel={() => {
              //   if (!task.title) onCancel()
              // }}
            />
          </TitleCell>
        </TaskTitleContainer>
        <TaskDetailsContainer>
          <TaskPrimaryDetails>
            <AssigneeFieldContainer>
              <TaskTitle>Assignee</TaskTitle>
              <AssigneeDropdown
                assigneeGroupedOptions={assigneeGroupedOptions}
                task={task}
                updateTask={updateTask}
              />
            </AssigneeFieldContainer>

            {!editAsTemplate && (
              <>
                <DueDateFieldContainer>
                  <TaskTitle>Due Date</TaskTitle>
                  <DueDateField
                    displayDefaultDurationDays={displayDefaultDurationDays}
                    dueDateLocalString={dueDateLocalString}
                    task={task}
                    transposedDueDate={transposedDueDate}
                    transposedEndOfToday={transposedEndOfToday}
                    updateTask={updateTask}
                  />
                </DueDateFieldContainer>
              </>
            )}
            <TaskFieldsContainer>
              <TaskTitle>Duration</TaskTitle>

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
                  deleteTaskNotification={deleteTaskNotification}
                  key={notification.id}
                  notificationOptions={notificationOptions}
                  recipientGroupedOptions={recipientGroupedOptions}
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
