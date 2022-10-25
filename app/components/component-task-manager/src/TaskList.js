import React, { useState } from 'react'
import { DragDropContext, Droppable } from 'react-beautiful-dnd'
import { v4 as uuid } from 'uuid'
import Task, { TaskHeader } from './Task'
import { RoundIconButton, TightColumn, MediumColumn } from '../../shared'

const TaskList = ({
  editAsTemplate,
  tasks: persistedTasks,
  manuscriptId,
  users,
  updateTask: persistTask,
  updateTasks: persistTasks,
  isReadOnly,
}) => {
  // The tasks we keep in state may contain an extra task that hasn't yet received a title.
  // This is treated as temporary and not persisted until it has a title.
  const [tasks, setTasks] = useState(persistedTasks)

  // Disabling overwriting state when new values come in, as optimisticResponse doesn't seem to respect array order, causing jitter with drag-n-drop
  /* useEffect(() => {
    setTasks(persistedTasks)
  }, [persistedTasks]) */

  const repackageTask = task => ({
    id: task.id,
    manuscriptId,
    isComplete: editAsTemplate ? false : task.isComplete,
    title: task.title,
    assigneeUserId: task.assignee?.id || null,
    defaultDurationDays: task.defaultDurationDays || 0,
    reminderPeriodDays: task.reminderPeriodDays || 0,
    dueDate: editAsTemplate ? null : new Date(task.dueDate),
    status: editAsTemplate ? 'Not started' : task.status,
  })

  const updateTask = (id, updatedTask) => {
    if (updatedTask.title)
      persistTask({
        variables: {
          task: repackageTask({ ...updatedTask, id }),
        },
      })
    setTasks(tasks.map(t => (t.id === id ? updatedTask : t)))
  }

  const addNewTask = () => {
    const today = new Date()
    today.setHours(17) // Use 5pm local time for deadlines.
    today.setMinutes(0)
    today.setSeconds(0)

    setTasks([
      ...tasks,
      {
        id: uuid(),
        isComplete: false,
        title: '',
        assignee: null,
        dueDate: today,
        status: 'Not started',
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
  }))

  return (
    <MediumColumn>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="droppable">
          {(provided, snapshot) => (
            <TightColumn {...provided.droppableProps} ref={provided.innerRef}>
              {!tasks.length && 'Add your first task...'}
              {tasks.length ? (
                <>
                  <TaskHeader editAsTemplate={editAsTemplate} />
                  {tasks.map((task, index) => (
                    <Task
                      editAsTemplate={editAsTemplate}
                      index={index}
                      isReadOnly={isReadOnly}
                      key={task.id}
                      onCancel={() => updateTasks(tasks.filter(t => t.title))}
                      onDelete={id =>
                        updateTasks(tasks.filter(t => t.id !== id))
                      }
                      task={task}
                      updateTask={updateTask}
                      userOptions={userOptions}
                    />
                  ))}
                </>
              ) : null}
              {provided.placeholder}
            </TightColumn>
          )}
        </Droppable>
      </DragDropContext>
      {!isReadOnly && (
        <RoundIconButton
          disabled={tasks.some(t => !t.title)}
          iconName="Plus"
          onClick={addNewTask}
          primary
          title="Add a new task"
        />
      )}
    </MediumColumn>
  )
}

export default TaskList
