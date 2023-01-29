import React from 'react'
import TaskList from './TaskList'
import {
  Container,
  Heading,
  SectionContent,
  PaddedContent,
  WidthLimiter,
} from '../../shared'

const TasksTemplate = ({
  tasks,
  users,
  updateTask,
  updateTasks,
  roles,
  updateTaskNotification,
  deleteTaskNotification,
}) => {
  return (
    <Container>
      <Heading>Task Template Builder</Heading>
      <WidthLimiter>
        <SectionContent>
          <PaddedContent>
            <TaskList
              deleteTaskNotification={deleteTaskNotification}
              editAsTemplate
              manuscriptId={null}
              roles={roles}
              tasks={tasks}
              updateTask={updateTask}
              updateTaskNotification={updateTaskNotification}
              updateTasks={updateTasks}
              users={users}
            />
          </PaddedContent>
        </SectionContent>
      </WidthLimiter>
    </Container>
  )
}

export default TasksTemplate
