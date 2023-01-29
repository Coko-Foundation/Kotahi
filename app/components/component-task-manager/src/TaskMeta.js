import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import moment from 'moment-timezone'
import { th } from '@pubsweet/ui-toolkit'
import { TextField } from '@pubsweet/ui'
import { v4 as uuid } from 'uuid'
import {
  RoundIconButton,
  MediumColumn,
  MinimalNumericUpDown,
  GroupedOptionsSelect,
  MinimalTextInput,
  CompactDetailLabel,
  MinimalDatePicker,
} from '../../shared'

import { transposeFromLocalToTimezone } from '../../../shared/dateUtils'
import TaskNotificationDetails from './TaskNotificationDetails'

const TaskMetaContainer = styled.div`
  width: 100%;
  display: flex;
`

const TitleCell = styled.div`
  display: flex;
`

const AssigneeCell = styled.div`
  justify-content: flex-start;
`

const DurationDaysCell = styled.div`
  justify-content: flex-start;
  position: relative;
`

const DueDateCell = styled.div`
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

const DaysNoteContainer = styled.div`
  position: absolute;
  transform: translate(4px, 16px);
`

const InputField = styled(TextField)`
  height: 40px;
  margin-bottom: 0;
`

const UnregisteredUserCell = styled.div`
  display: flex;
  & > div {
    margin: 20px 20px 0px 0px;
  }
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
  daysDifferenceLabel,
  dueDateLocalString,
  isOverdue,
  transposedEndOfToday,
  transposedDueDate,
  config,
  recipientGroupedOptions,
  deleteTaskNotification,
  ref,
}) => {
  const [isNewUser, setIsNewUser] = useState(
    task.assigneeType === 'unregisteredUser',
  )

  const [assigneeEmail, setAssigneeEmail] = useState(task.assigneeEmail)
  const [assigneeName, setAssigneeName] = useState(task.assigneeName)

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

  const [assigneedropdownState, setAssigneeDropdownState] = useState(false)

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
      ...taskEmailNotifications,
      {
        id: uuid(),
        taskId: task.id,
        recipientType: null,
      },
    ])
  }

  function handleAssigneeInput(selectedOption, selectedTask) {
    setAssigneeDropdownState(selectedOption)

    switch (selectedOption.key) {
      case 'userRole':
        setIsNewUser(false)
        updateTask(selectedTask.id, {
          ...selectedTask,
          assigneeType: selectedOption.value,
          assigneeUserId: null,
          assignee: null,
          assigneeName: null,
          assigneeEmail: null,
        })
        break
      case 'registeredUser':
        setIsNewUser(false)
        updateTask(selectedTask.id, {
          ...selectedTask,
          assigneeUserId: selectedOption?.value,
          assignee: selectedOption?.user,
          assigneeType: selectedOption.key,
          assigneeName: null,
          assigneeEmail: null,
        })
        break
      case 'unregisteredUser':
        setIsNewUser(true)
        updateTask(selectedTask.id, {
          ...selectedTask,
          assigneeUserId: null,
          assignee: null,
          assigneeType: selectedOption.key,
          assigneeName: null,
          assigneeEmail: null,
        })
        break
      default:
    }
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
              <AssigneeCell title={task.assignee?.username}>
                <GroupedOptionsSelect
                  aria-label="Assignee"
                  data-testid="Assignee_select"
                  dropdownState={assigneedropdownState}
                  isClearable
                  label="Assignee"
                  onChange={selected => handleAssigneeInput(selected, task)}
                  options={assigneeGroupedOptions}
                  placeholder="Select..."
                  value={task.assignee?.id || task.assigneeType}
                />
              </AssigneeCell>
              {isNewUser && (
                <UnregisteredUserCell>
                  <InputField
                    data-cy="new-user-email"
                    onChange={e => {
                      setAssigneeEmail(e.target.value)
                      updateTask(task.id, {
                        ...task,
                        assigneeUserId: null,
                        assignee: null,
                        assigneeType: 'unregisteredUser',
                        assigneeEmail: e.target.value,
                      })
                    }}
                    placeholder="Email"
                    value={assigneeEmail}
                  />
                  <InputField
                    data-cy="new-user-name"
                    onChange={val => {
                      setAssigneeName(val.target.value)
                      updateTask(task.id, {
                        ...task,
                        assigneeUserId: null,
                        assignee: null,
                        assigneeType: 'unregisteredUser',
                        assigneeName: val.target.value,
                      })
                    }}
                    placeholder="Name"
                    value={assigneeName}
                  />
                </UnregisteredUserCell>
              )}
            </TaskFieldsContainer>

            {!editAsTemplate && (
              <>
                <TaskFieldsContainer>
                  <DurationTitle>Due Date</DurationTitle>

                  <DueDateCell title={dueDateLocalString}>
                    <DaysNoteContainer>
                      <CompactDetailLabel isWarning={isOverdue}>
                        {daysDifferenceLabel}
                      </CompactDetailLabel>
                    </DaysNoteContainer>
                    <MinimalDatePicker
                      clearIcon={null}
                      format="yyyy-MM-dd"
                      minDate={transposedEndOfToday}
                      onChange={val =>
                        updateTask(task.id, {
                          ...task,
                          dueDate: moment
                            .tz(
                              transposeFromLocalToTimezone(
                                val,
                                config.teamTimezone,
                              ),
                              config.teamTimezone,
                            )
                            .endOf('day')
                            .toDate(),
                        })
                      }
                      position="bottom center"
                      suppressTodayHighlight
                      value={transposedDueDate}
                    />
                  </DueDateCell>
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
            !taskEmailNotifications.length) &&
            'Add Notification Recipient'}
          {taskEmailNotifications.length ? (
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
                taskEmailNotifications.length
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
