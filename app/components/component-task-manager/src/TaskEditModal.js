import React, { useCallback, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { th, grid } from '@pubsweet/ui-toolkit'
import { v4 as uuid } from 'uuid'
import { X as CloseIcon } from 'react-feather'
import { debounce } from 'lodash'
import { ActionButton, TextInput } from '../../shared'

import TaskNotificationDetails from './TaskNotificationDetails'
import AssigneeDropdown from './AssigneeDropdown'
import DueDateField from './DueDateField'
import Modal from '../../component-modal/src/Modal'
import SecondaryActionButton from '../../shared/SecondaryActionButton'
import CounterField from '../../shared/CounterField'
import theme from '../../../theme'
import { convertTimestampToDateString } from '../../../shared/dateUtils'

const TaskMetaModalContainer = styled.div`
  background-color: ${th('colorBackground')};
  width: 1200px;
  display: flex;
  flex-direction: column;
  min-height: 480px;
  z-index: 10000;
  -webkit-font-smoothing: antialiased;
`

const TitleCell = styled.div`
  display: flex;
  align-items: center;
  background: transparent;
  line-height: 1em;
  height: 45px;
`

const DurationDaysCell = styled.div`
  justify-content: flex-start;
  position: relative;
  height: 45px;
  display: flex;
  align-items: center;
`

const BaseFieldsContainer = styled.div`
  padding: ${grid(3.5)} ${grid(3)};
`

const TaskPrimaryFieldsContainer = styled(BaseFieldsContainer)`
  display: flex;
  padding-top: 0;
`

const TaskRecipientsDetailsContainer = styled(BaseFieldsContainer)`
  border-bottom: 2px solid rgba(191, 191, 191, 0.5);
  box-shadow: 0 10px 10px -10px #d9d9d9;
  min-height: 260px;
`

const TaskRecipientsContainer = styled.div`
  margin-bottom: 20px;
`

const TaskActionsContainer = styled(BaseFieldsContainer)`
  padding-top: ${grid(2)};
  padding-bottom: ${grid(2)};
  display: flex;
  justify-content: flex-end;
`

const TaskDetailsContainer = styled.div`
  padding-bottom: 5px;
  border-bottom: 2px solid rgba(191, 191, 191, 0.5);
`

const TaskCloseActionContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: 14px 14px 24px 14px;

  button {
    cursor: pointer;
    background: transparent;
    border: none;

    svg {
      stroke: ${theme.colors.neutral.gray20};
    }
  }
`

const TaskTitle = styled.div`
  font-family: 'Roboto';
  font-style: normal;
  font-weight: 500;
  font-size: ${theme.fontSizeBase};
  line-height: 19px;
  letter-spacing: 0.01em;
  color: ${theme.colors.neutral.gray20};
  margin-bottom: 4px;
`

const BaseFieldContainer = styled.div`
  display: flex;
  flex-direction: column;

  & + div {
    margin-left: 20px;
  }
`

const TitleFieldContainer = styled(BaseFieldContainer)`
  flex: 0 0 34em;
`

const AssigneeFieldContainer = styled(BaseFieldContainer)`
  flex: 0 0 7.8em;
`

const DueDateFieldContainer = styled(BaseFieldContainer)`
  flex: 0 0 7.8em;
`

const TaskNotificationLogsContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: flex-end;
`

const NotificationLogsToggle = styled.button`
  padding: 20px 10px;
  background-color: transparent;
  border: none;
  font-size: ${theme.fontSizeBaseSmall};
  color: ${theme.colorPrimary};
  text-decoration: underline;
`

const NotificationLogs = styled.div`
  margin: 10px 0;
  text-align: left;
  font-size: ${theme.fontSizeBaseSmall};
  color: ${theme.colorPrimary};
`

const TaskActionContainer = styled.div`
  display: flex;
  justify-content: space-between;
`

const TaskEditModal = ({
  task,
  updateTask,
  updateTaskNotification: persistTaskNotification,
  assigneeGroupedOptions,
  isReadOnly,
  editAsTemplate,
  dueDateLocalString,
  transposedEndOfToday,
  transposedDueDate,
  recipientGroupedOptions,
  deleteTaskNotification,
  displayDefaultDurationDays,
  createTaskEmailNotificationLog,
  notificationOptions,
  manuscript,
  currentUser,
  sendNotifyEmail,
  isOpen,
  onSave,
  onCancel,
}) => {
  const [taskEmailNotifications, setTaskNotifications] = useState(
    task.emailNotifications ?? [],
  )

  const [selectedDurationDays, setSelectedDurationDays] = useState(
    task.defaultDurationDays,
  )

  const [taskTitle, setTaskTitle] = useState(task?.title || '')

  const updateTaskTitleDebounce = useCallback(
    debounce(updateTask ?? (() => {}), 1000),
    [],
  )

  useEffect(() => {
    return updateTaskTitleDebounce.flush()
  }, [])

  const updateTaskTitle = value => {
    setTaskTitle(value)
    updateTaskTitleDebounce(task.id, { ...task, title: value })
  }

  useEffect(() => {
    setTaskNotifications(task.emailNotifications)
    setTaskTitle(task.title)
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

  const [isToggled, setToggled] = useState(false)

  const status = {
    NOT_STARTED: 'Not started',
    START: 'Start',
    IN_PROGRESS: 'In progress',
    PAUSED: 'Paused',
    DONE: 'Done',
  }

  return (
    <Modal isOpen={isOpen}>
      <TaskMetaModalContainer>
        <TaskCloseActionContainer>
          <button onClick={() => onCancel(false)} type="button">
            <CloseIcon size={20} />
          </button>
        </TaskCloseActionContainer>
        <TaskDetailsContainer>
          <TaskPrimaryFieldsContainer>
            <TitleFieldContainer>
              <TaskTitle>Task title</TaskTitle>
              <TitleCell>
                <TextInput
                  autoFocus={!taskTitle}
                  onChange={event => updateTaskTitle(event.target.value)}
                  placeholder="Give your task a name..."
                  value={taskTitle}
                />
              </TitleCell>
            </TitleFieldContainer>
            <AssigneeFieldContainer>
              <TaskTitle>Assignee</TaskTitle>
              <AssigneeDropdown
                assigneeGroupedOptions={assigneeGroupedOptions}
                task={task}
                unregisteredFieldsAlign="row"
                updateTask={updateTask}
              />
            </AssigneeFieldContainer>
            {!editAsTemplate && task && task.status !== status.NOT_STARTED ? (
              <DueDateFieldContainer>
                <TaskTitle>Due date</TaskTitle>
                <DueDateField
                  displayDefaultDurationDays={displayDefaultDurationDays}
                  dueDateLocalString={dueDateLocalString}
                  position="bottom center"
                  task={task}
                  transposedDueDate={transposedDueDate}
                  transposedEndOfToday={transposedEndOfToday}
                  updateTask={updateTask}
                />
              </DueDateFieldContainer>
            ) : (
              <div>
                <TaskTitle>Duration in days</TaskTitle>
                <DurationDaysCell>
                  <CounterField
                    minValue={0}
                    onChange={val => {
                      setSelectedDurationDays(val)
                      updateTask(task.id, {
                        ...task,
                        defaultDurationDays: val,
                      })
                    }}
                    showNone
                    value={task.defaultDurationDays}
                  />
                </DurationDaysCell>
              </div>
            )}
          </TaskPrimaryFieldsContainer>
        </TaskDetailsContainer>
        <TaskRecipientsDetailsContainer>
          <TaskRecipientsContainer>
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
                    selectedDurationDays={selectedDurationDays}
                    sendNotifyEmail={sendNotifyEmail}
                    task={task}
                    taskEmailNotification={notification}
                    updateTaskNotification={updateTaskNotification}
                  />
                ))}
              </>
            ) : null}
          </TaskRecipientsContainer>
          <TaskActionContainer>
            {!isReadOnly && (
              <SecondaryActionButton
                disabled={
                  taskEmailNotifications?.length
                    ? taskEmailNotifications.some(t => !t.recipientType)
                    : false
                }
                onClick={addNewTaskNotification}
                primary
              >
                Add Notification Recipient
              </SecondaryActionButton>
            )}
          </TaskActionContainer>
          {!editAsTemplate ? (
            task.notificationLogs &&
            task.notificationLogs.length !== 0 && (
              <TaskNotificationLogsContainer>
                <NotificationLogsToggle onClick={() => setToggled(!isToggled)}>
                  {isToggled
                    ? `Hide all notifications sent (${task.notificationLogs?.length})`
                    : `Show all notifications sent (${task.notificationLogs?.length})`}
                </NotificationLogsToggle>
                {isToggled && (
                  <NotificationLogs>
                    {task.notificationLogs.map(log => (
                      <>
                        <div>{convertTimestampToDateString(log.created)}</div>
                        <div>{log.content}</div>
                        <br />
                      </>
                    ))}
                  </NotificationLogs>
                )}
              </TaskNotificationLogsContainer>
            )
          ) : (
            <></>
          )}
        </TaskRecipientsDetailsContainer>

        <TaskActionsContainer>
          <ActionButton onClick={() => onSave(false)} primary>
            Save
          </ActionButton>
        </TaskActionsContainer>
      </TaskMetaModalContainer>
    </Modal>
  )
}

TaskEditModal.propTypes = {
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
  /** Callback for when a new task is abandoned before receiving a title (e.g. escape was pressed) */
  onCancel: PropTypes.func,
  updateTask: PropTypes.func.isRequired,
}
TaskEditModal.defaultProps = {
  onCancel: () => {},
}

export default TaskEditModal
