import React, { useContext, useState, useEffect } from 'react'
import { DragDropContext, Droppable } from 'react-beautiful-dnd'
import { v4 as uuid } from 'uuid'
// import moment from 'moment-timezone'
import styled from 'styled-components'
import Task from './Task'
import { RoundIconButton, TightColumn, MediumColumn } from '../../shared'
import { ConfigContext } from '../../config/src'

const TaskListContainer = styled.div`
  -webkit-font-smoothing: antialiased;
`

const AddTaskContainer = styled.div`
  margin-left: 54px;
  padding: 0 8px;
`

const HeaderRowContainer = styled.div`
  padding: 10px 8px 0;
`

const HeaderRow = styled.div`
  align-items: center;
  display: flex;
  gap: calc(8px * 1);
`

const HeaderLabel = styled.div`
  font-weight: 500;
`

const TitleHeader = styled(HeaderLabel)`
  flex: 1 1 40em;
`

const TitleLabel = styled.div`
  padding-left: 3.5em;
`

const AssigneeHeader = styled(HeaderLabel)`
  flex: 1 1 15em;
`

const DurationHeader = styled(HeaderLabel)`
  flex: ${props => (props.editAsTemplate ? '0 0 10em' : '0 0 18em')};
  margin-left: ${props => (props.editAsTemplate ? '10px' : 0)};
`

const TaskList = ({
  editAsTemplate,
  tasks: persistedTasks,
  manuscriptId,
  users,
  roles,
  updateTask: persistTask,
  updateTasks: persistTasks,
  isReadOnly,
  updateTaskNotification,
  deleteTaskNotification,
  currentUser,
  manuscript,
  sendNotifyEmail,
  createTaskEmailNotificationLog,
  emailTemplates,
}) => {
  const config = useContext(ConfigContext)
  // The tasks we keep in state may contain an extra task that hasn't yet received a title.
  // This is treated as temporary and not persisted until it has a title.
  const [tasks, setTasks] = useState(persistedTasks)

  useEffect(() => {
    setTasks(
      // Reorder required, as optimisticResponse doesn't honour array order, causing jitter with drag-n-drop
      (persistedTasks || [])
        .slice()
        .sort((a, b) => a.sequenceIndex - b.sequenceIndex),
    )
  }, [persistedTasks])

  const repackageTask = task => ({
    id: task.id,
    manuscriptId,
    groupId: config.groupId,
    title: task.title,
    assigneeUserId: task.assignee?.id || null,
    defaultDurationDays: task.defaultDurationDays,
    reminderPeriodDays: task.reminderPeriodDays || 0,
    dueDate: getDueDate(editAsTemplate, task.dueDate),
    status: editAsTemplate ? 'Not started' : task.status,
    assigneeType: task.assigneeType || null,
    assigneeName: task.assigneeName || null,
    assigneeEmail: task.assigneeEmail || null,
  })

  function getDueDate(isEditAsTemplate, dueDate) {
    if (isEditAsTemplate) {
      return null
    }

    return dueDate ? new Date(dueDate) : null
  }

  const updateTask = (id, updatedTask) => {
    if (updatedTask.title) {
      persistTask({
        variables: {
          task: repackageTask({ ...updatedTask, id }),
        },
      })
    }

    setTasks(currentTasks =>
      currentTasks.map(t => (t.id === id ? updatedTask : t)),
    )
  }

  const addNewTask = () => {
    setTasks([
      ...tasks,
      {
        id: uuid(),
        title: '',
        assignee: null,
        dueDate: null,
        status: 'Not started',
        defaultDurationDays: null,
      },
    ])
  }

  const updateTasks = updatedTasks => {
    const tasksToPersist = updatedTasks
      .filter(t => t.title)
      .map(t => repackageTask(t))

    persistTasks({
      variables: {
        manuscriptId,
        groupId: config.groupId,
        tasks: tasksToPersist,
      },
    })
    setTasks(updatedTasks)
  }

  const onDragEnd = item => {
    if (!item.destination) return // dropped outside the list
    const result = tasks.filter((x, i) => i !== item.source.index)
    result.splice(item.destination.index, 0, tasks[item.source.index])
    updateTasks(result)
  }

  const userOptions = users.map(u => ({
    label: u.username,
    value: u.id,
    user: u,
    key: 'registeredUser',
  }))

  const userRoles = roles.map(role => ({
    label: role.name,
    value: role.slug,
    key: 'userRole',
  }))

  const assigneeGroupedOptions = [
    {
      options: [
        {
          label: 'Unregistered User',
          value: 'unregisteredUser',
          key: 'unregisteredUser',
        },
      ],
    },
    {
      label: 'User Roles',
      options: userRoles,
    },

    {
      label: 'Registered Users',
      options: userOptions,
    },
  ]

  const recipientGroupedOptions = [
    {
      options: [
        {
          label: 'Unregistered User',
          value: 'unregisteredUser',
          key: 'unregisteredUser',
        },
      ],
    },
    {
      options: [{ label: 'Assignee', value: 'assignee', key: 'assignee' }],
    },
    {
      label: 'User Roles',
      options: userRoles,
    },
    {
      label: 'Registered Users',
      options: userOptions,
    },
  ]

  if (editAsTemplate) {
    assigneeGroupedOptions.shift()
    recipientGroupedOptions.shift()
  }

  return (
    <TaskListContainer>
      <MediumColumn>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="droppable">
            {(provided, snapshot) => (
              <TightColumn {...provided.droppableProps} ref={provided.innerRef}>
                {!tasks.length && (
                  <AddTaskContainer>Add your first task...</AddTaskContainer>
                )}
                {tasks.length ? (
                  <>
                    <HeaderRowContainer>
                      <HeaderRow>
                        <TitleHeader>
                          <TitleLabel>Title</TitleLabel>
                        </TitleHeader>
                        <AssigneeHeader>Assignee</AssigneeHeader>
                        <DurationHeader editAsTemplate={editAsTemplate}>
                          {editAsTemplate
                            ? 'Duration in days'
                            : 'Duration/Due Date'}
                        </DurationHeader>
                      </HeaderRow>
                    </HeaderRowContainer>
                    {tasks.map((task, index) => (
                      <Task
                        assigneeGroupedOptions={assigneeGroupedOptions}
                        createTaskEmailNotificationLog={
                          createTaskEmailNotificationLog
                        }
                        currentUser={currentUser}
                        deleteTaskNotification={deleteTaskNotification}
                        editAsTemplate={editAsTemplate}
                        emailTemplates={emailTemplates}
                        index={index}
                        isReadOnly={isReadOnly}
                        key={task.id}
                        manuscript={manuscript}
                        onCancel={() => updateTasks(tasks.filter(t => t.title))}
                        onDelete={id =>
                          updateTasks(tasks.filter(t => t.id !== id))
                        }
                        recipientGroupedOptions={recipientGroupedOptions}
                        sendNotifyEmail={sendNotifyEmail}
                        task={task}
                        updateTask={updateTask}
                        updateTaskNotification={updateTaskNotification}
                      />
                    ))}
                  </>
                ) : null}
                {provided.placeholder}
              </TightColumn>
            )}
          </Droppable>
        </DragDropContext>
        <AddTaskContainer>
          <RoundIconButton
            disabled={tasks.some(t => !t.title)}
            iconName="Plus"
            onClick={addNewTask}
            primary
            title="Add a new task"
          />
        </AddTaskContainer>
      </MediumColumn>
    </TaskListContainer>
  )
}

export default TaskList
