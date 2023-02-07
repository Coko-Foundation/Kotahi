import React from 'react'
import styled from 'styled-components'
import Dropdown from 'react-dropdown'
import { UPDATE_TASK_STATUS } from '../../../queries'
import { useMutation } from '@apollo/client'
import { Pause as PauseIcon, ChevronUp, ChevronDown } from 'react-feather'

const StartButton = styled.button`
  background: #5DAB41;
  box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.25);
  border-radius: 6px;
  width: 111px;
  height: 45px;
  font-family: 'Roboto';
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  line-height: 19px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  letter-spacing: 0.01em;
  color: #FFFFFF;
`

const BaseDropdown = styled(Dropdown)`
  box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.25);
  border-radius: 4px;
  font-family: 'Roboto';
  font-style: normal;
  font-weight: 500;
  font-size: 14.5px;
  line-height: 17px;
  width: 111px;
  height: 45px;
  letter-spacing: 0.01em;

  .Dropdown-control {
    border: 0;
    padding: 0;
    background-color: #FFFFFF;
    display: flex;
    align-items: center;
    justify-content: space-between;
    text-align: center;
    height: 100%;
    padding: 4px;
  }

  .Dropdown-arrow-wrapper {
    display: flex;
  }

  .Dropdown-menu {
    border: 2px solid #ccc;
    width: 111px;
    margin-left: -2px;
    margin-top: 2px;
    border-radius: 2px;
  }
`

const InProgressDropdown = styled(BaseDropdown)`
  border: 2px solid #6C6C6C;

  .Dropdown-placeholder {
    color: #6C6C6C;
  }

  .Dropdown-arrow-wrapper > svg {
    stroke: #6C6C6C;
  }
`

const PausedDropdown = styled(BaseDropdown)`
  border: 2px solid #D29435;

  .Dropdown-placeholder {
    color: #D29435;
  }

  .Dropdown-arrow-wrapper > svg {
    stroke: #D29435;
  }
`

const DoneDropdown = styled(BaseDropdown)`
  border: 2px solid #5DAB41;

  .Dropdown-placeholder {
    color: #5DAB41;
  }

  .Dropdown-arrow-wrapper > svg {
    stroke: #5DAB41;
  }
`

const StatusDropdown = ({ task, onStatusUpdate }) => {
  const status = {
    NOT_STARTED: 'Not started',
    START: 'Start',
    IN_PROGRESS: 'In progress',
    PAUSED: 'Paused',
    DONE: 'Done',
  }

  const [updateTaskStatus] = useMutation(UPDATE_TASK_STATUS, {
    refetchQueries: ['getTasksQuery'],
  })

  const handleStatusUpdate = async taskStatus => {
    const { data } = await updateTaskStatus({
      variables: {
        task: {
          id: task.id,
          status: taskStatus,
        },
      },
    })

    onStatusUpdate(data.updateTaskStatus)
  }

  if (task.status === status.NOT_STARTED) {
    return (
      <StartButton
        onClick={() => handleStatusUpdate(status.IN_PROGRESS)}
      >
        Start
      </StartButton>
    )
  }

  let dropdownOptions = []
  let DropdownComponent = <></>
  let IconComponent = <></>
  switch (task.status) {
    case status.IN_PROGRESS:
      dropdownOptions = [
        { label: 'Pause', value: status.PAUSED },
        { label: 'Done', value: status.DONE },
      ]
      DropdownComponent = InProgressDropdown
      break;
    case status.PAUSED:
      dropdownOptions = [
        { label: 'Continue', value: status.IN_PROGRESS },
        { label: 'Done', value: status.DONE },
      ]
      IconComponent = PauseIcon
      DropdownComponent = PausedDropdown
      break;
    case status.DONE:
      dropdownOptions = [
        { label: 'Continue', value: status.IN_PROGRESS },
      ]
      DropdownComponent = DoneDropdown
      break;
  }
  return <DropdownComponent
    onChange={selected => handleStatusUpdate(selected.value)}
    options={dropdownOptions}
    placeholder="Select status"
    value={task.status}
    arrowOpen={<ChevronUp size={20} />}
    arrowClosed={<ChevronDown size={20} />}
  />
}

export default StatusDropdown
