import React from 'react'
import TaskList from './TaskList'
import {
  Container,
  Heading,
  SectionContent,
  PaddedContent,
  WidthLimiter,
} from '../../shared'

const TasksTemplate = ({ tasks, users, updateTask, updateTasks }) => {
  return (
    <Container>
      <Heading>Task Template Builder</Heading>
      <WidthLimiter>
        <SectionContent>
          <PaddedContent>
            <TaskList
              editAsTemplate
              manuscriptId={null}
              tasks={tasks}
              updateTask={updateTask}
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
