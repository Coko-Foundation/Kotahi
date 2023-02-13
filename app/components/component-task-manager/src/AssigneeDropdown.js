import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { TextField } from '@pubsweet/ui/dist/atoms'
import { GroupedOptionsSelect } from '../../shared'
import TextInput from './TextInput'

const AssigneeCellContainer = styled.div`
  flex: 1 1 15em;
  justify-content: flex-start;
  flex-direction: column;
  align-items: start;
`

const TaskListAssigneeCell = styled.div`
  width: 100%;
`

const TaskMetaAssigneeCell = styled.div`
  justify-content: flex-start;
  width: 290px;
`

const TaskListUnregisteredUserCell = styled.div`
  display: flex;
  flex-direction: column;
  & > input {
    margin: 10px 10px 0px 0px;
  }
`

const TaskMetaUnregisteredUserCell = styled.div`
  display: flex;
  margin-top: 10px;
  justify-content: space-between;

  > input:first-child {
    margin-right: 10px;
  }
`

const TaskListInputField = styled(TextField)`
  height: 30px;
  margin-bottom: 0;
`

const TaskMetaInputField = styled(TextField)`
  height: 40px;
  margin-bottom: 0;
`

const AssigneeDropdown = ({
  assigneeGroupedOptions,
  task,
  updateTask,
  isList = false,
}) => {
  const [dropdownState, setDropdownState] = useState(false)

  const [isNewUser, setIsNewUser] = useState(
    task.assigneeType === 'unregisteredUser',
  )

  const [assigneeEmail, setAssigneeEmail] = useState(task.assigneeEmail)
  const [assigneeName, setAssigneeName] = useState(task.assigneeName)

  useEffect(() => {
    setAssigneeEmail(task.assigneeEmail)
    setIsNewUser(task.assigneeType === 'unregisteredUser')
    setAssigneeName(task.assigneeName)
  }, [
    task.assigneeEmail,
    task.assigneeName,
    task.assigneeType === 'unregisteredUser',
  ])

  function handleAssigneeInput(selectedOption, selectedTask) {
    setDropdownState(selectedOption)

    if (!selectedOption) {
      setIsNewUser(false)
      updateTask(selectedTask.id, {
        ...selectedTask,
        assigneeUserId: null,
        assignee: null,
        assigneeType: null,
        assigneeName: null,
        assigneeEmail: null,
      })
      return
    }

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

  const UnregisteredUserCell = isList
    ? TaskListUnregisteredUserCell
    : TaskMetaUnregisteredUserCell

  const groupedOptionsComponent = (
    <GroupedOptionsSelect
      aria-label="Assignee"
      data-testid="Assignee_select"
      dropdownState={dropdownState}
      isClearable
      label="Assignee"
      onChange={selected => handleAssigneeInput(selected, task)}
      options={assigneeGroupedOptions}
      placeholder="Select..."
      value={task.assignee?.id || task.assigneeType}
    />
  )

  const newUserComponent = isNewUser && (
    <UnregisteredUserCell>
      <TextInput
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
      <TextInput
        data-cy="new-user-name"
        onChange={e => {
          setAssigneeName(e.target.value)
          updateTask(task.id, {
            ...task,
            assigneeUserId: null,
            assignee: null,
            assigneeType: 'unregisteredUser',
            assigneeName: e.target.value,
          })
        }}
        placeholder="Name"
        value={assigneeName}
      />
    </UnregisteredUserCell>
  )

  if (isList) {
    return (
      <AssigneeCellContainer>
        <TaskListAssigneeCell title={task.assignee?.username}>
          {groupedOptionsComponent}
          {newUserComponent}
        </TaskListAssigneeCell>
      </AssigneeCellContainer>
    )
  }

  return (
    <>
      <TaskMetaAssigneeCell title={task.assignee?.username}>
        {groupedOptionsComponent}
      </TaskMetaAssigneeCell>
      {newUserComponent}
    </>
  )
}

export default AssigneeDropdown
