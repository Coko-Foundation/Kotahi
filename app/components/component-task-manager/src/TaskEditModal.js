import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { th, grid } from '@pubsweet/ui-toolkit'
import { v4 as uuid } from 'uuid'
import {
  RoundIconButton,
  MediumColumn,
  MinimalNumericUpDown,
  LooseColumn,
  MediumRow,
  ActionButton,
} from '../../shared'

import TaskNotificationDetails from './TaskNotificationDetails'
import AssigneeDropdown from './AssigneeDropdown'
import DueDateField from './DueDateField'
import TextInput from './TextInput'
import Modal from '../../component-modal/src'

const TaskMetaModalContainer = styled(LooseColumn)`
  background-color: ${th('colorBackground')};
  width: 1200px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 480px;
  z-index: 10000;
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

const BaseFieldsContainer = styled.div`
  padding: ${grid(2.5)} ${grid(3)};
`
const TaskPrimaryFieldsContainer = styled(BaseFieldsContainer)`
  display: flex;
`

const TaskDetailsContainer = styled.div`
  padding-bottom: 25px;
  border-bottom: 2px solid rgba(191,191,191, 0.5);
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

const BaseFieldContainer = styled.div`
  display: flex;
  flex-direction: column;

  & + div {
    margin-left: 20px;
  }
`
const TitleFieldContainer = styled(BaseFieldContainer)`
  flex: 0 0 35em;
`
const AssigneeFieldContainer = styled(BaseFieldContainer)`
  flex: 0 0 7.8em;
`
const DueDateFieldContainer = styled(BaseFieldContainer)`
  flex: 0 0 7.8em;
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
  isOpen,
  onSave,
  onCancel,
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
    <Modal isOpen={isOpen}>
      <TaskMetaModalContainer>
        <MediumColumn>
          <TaskDetailsContainer>
            <TaskPrimaryFieldsContainer>
              <TitleFieldContainer>
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
              </TitleFieldContainer>
              <AssigneeFieldContainer>
                <TaskTitle>Assignee</TaskTitle>
                <AssigneeDropdown
                  assigneeGroupedOptions={assigneeGroupedOptions}
                  task={task}
                  updateTask={updateTask}
                />
              </AssigneeFieldContainer>
              {!editAsTemplate && (
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
              )}
              <div>
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
              </div>
            </TaskPrimaryFieldsContainer>
          </TaskDetailsContainer>
          <BaseFieldsContainer>
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
          </BaseFieldsContainer>
        </MediumColumn>
        <BaseFieldsContainer>
          <ActionButton
            onClick={() => onSave(false)}
            primary
          >
            Save
          </ActionButton>
          &nbsp;&nbsp;
          <ActionButton onClick={() => onCancel(false)}>
            Cancel
          </ActionButton>
        </BaseFieldsContainer>
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
  index: PropTypes.number.isRequired,
  /** Callback for when a new task is abandoned before receiving a title (e.g. escape was pressed) */
  onCancel: PropTypes.func,
  updateTask: PropTypes.func.isRequired,
}
TaskEditModal.defaultProps = {
  onCancel: () => {},
}

export default TaskEditModal
