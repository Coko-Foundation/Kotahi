import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import Dropdown from 'react-dropdown'
import { UPDATE_TASK_STATUS } from '../../../queries'
import { useMutation } from '@apollo/client'
import './StatusDropdown.css'

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
  cursor: pointer;
`

const BaseDropdown = styled.div`
  border: 2px solid #6C6C6C;
  filter: drop-shadow(0px 2px 2px rgba(0, 0, 0, 0.25));
  border-radius: 4px;
  font-family: 'Roboto';
  font-style: normal;
  font-weight: 500;
  font-size: 14.5px;
  line-height: 17px;
  display: flex;
  align-items: center;
  text-align: center;
  letter-spacing: 0.01em;
  color: #6C6C6C;
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
  let placeholderClassName = ""
  let dropdownRootClassName = ""
  switch (task.status) {
    case status.IN_PROGRESS:
      dropdownRootClassName = "Dropdown-root-inprogress"
      placeholderClassName = "Placeholder-inprogress"
      dropdownOptions = [
        { label: 'Pause', value: status.PAUSED },
        { label: 'Done', value: status.DONE },
      ]
      break;
    case status.PAUSED:
      dropdownRootClassName = "Dropdown-root-paused"
      placeholderClassName = "Placeholder-paused"
      dropdownOptions = [
        { label: 'Continue', value: status.IN_PROGRESS },
        { label: 'Done', value: status.DONE },
      ]
      break;
    case status.DONE:
      dropdownRootClassName = "Dropdown-root-done"
      placeholderClassName = "Placeholder-done"
      dropdownOptions = [
        { label: 'Continue', value: status.IN_PROGRESS },
      ]
      break;
  }
  return <Dropdown
    className={`base-Dropdown-root ${dropdownRootClassName}`}
    controlClassName="base-Dropdown-control"
    arrowClassName="base-Dropdown-arrow"
    placeholderClassName={placeholderClassName}
    menuClassName="base-Dropdown-menu"
    optionClassName=""
    onChange={selected => handleStatusUpdate(selected.value)}
    options={dropdownOptions}
    placeholder="Select status"
    value={task.status}
  />
}

export default StatusDropdown
