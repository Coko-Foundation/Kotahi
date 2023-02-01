import React, { useState, useContext, useEffect } from 'react'
import styled, { ThemeContext, css } from 'styled-components'
import {
  // MinimalTextInput,
  // MinimalDatePicker,
  // MinimalButton,
  // MinimalNumericUpDown,
  // CompactDetailLabel,
  // ActionButton,
  // LooseColumn,
  // MediumRow,
  GroupedOptionsSelect,
} from '../../shared'
import { TextField } from '@pubsweet/ui/dist/atoms'

const UnregisteredUserCell = styled.div`
  display: flex;
  flex-direction: column;
  & > div {
    margin: 10px 10px 0px 0px;
  }
`

const InputField = styled(TextField)`
  height: 30px;
  margin-bottom: 0;
`

const AssigneeDropdown = ({ assigneeGroupedOptions, task, updateTask }) => {
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
    }
  }

  return (
    <>
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
      )}
    </>
  )
}
export default AssigneeDropdown
