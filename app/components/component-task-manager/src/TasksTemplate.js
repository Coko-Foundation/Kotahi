import React from 'react'
import styled from 'styled-components'
import TaskList from './TaskList'
import { Container, Heading, SectionContent, WidthLimiter } from '../../shared'

const TaskListContainer = styled.div`
  padding: 18px 8px;
`

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
          <TaskListContainer>
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
          </TaskListContainer>
        </SectionContent>
      </WidthLimiter>
    </Container>
  )
}

export default TasksTemplate
