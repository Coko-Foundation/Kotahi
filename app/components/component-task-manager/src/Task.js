import React, { useState, useEffect, useContext, useRef } from 'react'
import PropTypes from 'prop-types'
import moment from 'moment-timezone'
import styled, { ThemeContext, css } from 'styled-components'
import { Draggable } from 'react-beautiful-dnd'
import { Circle, CheckCircle } from 'react-feather'
import { th, grid } from '@pubsweet/ui-toolkit'
import { useMutation } from '@apollo/client'
import { transposeFromTimezoneToLocal } from '../../../shared/dateUtils'
import {
  MinimalButton,
  MinimalNumericUpDown,
  CompactDetailLabel,
  ActionButton,
  LooseColumn,
  MediumRow,
} from '../../shared'

import { DragVerticalIcon, EllipsisIcon } from '../../shared/Icons'
import Modal from '../../component-modal/src'
import { ConfigContext } from '../../config/src'
import TaskMeta from './TaskMeta'
import { UPDATE_TASK_STATUS } from '../../../queries'
import AssigneeDropdown from './AssigneeDropdown'
import DueDateField from './DueDateField'
import StatusDropdown from './StatusDropdown'
import TextInput from './TextInput'

const TaskRow = styled.div`
  align-items: flex-start;
  display: flex;
  gap: ${grid('1')};

  & > div {
    align-items: center;
    background: transparent;
    display: flex;
    line-height: 1em;
  }

  & > div:last-child {
    border-right: ${grid(1)} solid transparent;
  }

  ${props =>
    props.isOverdue
      ? css`
          & > div:last-child {
            border-right-color: ${th('colorError')};
          }
        `
      : ''}

  &:hover > div:first-child > div:first-child > svg,
  &:hover > div:first-child > button:last-child > svg {
    display: block;
  }
`

/* stylelint-disable no-descending-specificity */
const TaskHeaderRow = styled(TaskRow)`
  gap: ${grid('1')};

  & > div {
    font-family: 'Roboto';
    font-style: normal;
    font-weight: 500;
    font-size: ${th('fontSizeHeading6')};
    line-height: 19px;
    letter-spacing: 0.01em;
    color: #323232;
    background: none;
  }

  & > div > div {
    height: unset;
  }
`
/* stylelint-enable no-descending-specificity */

const TaskRowContainer = styled.div`
  padding-top: 15px;
  padding-bottom: 15px;

  & + div {
    border-top: 2px solid rgba(191, 191, 191, 0.5);
  }
`

const BaseHeader = styled.div`
  margin-bottom: 4px;
`

const TitleHeader = styled(BaseHeader)`
  flex: 1 1 38em;
  padding-left: 3.5em;
`

const AssigneeHeader = styled(BaseHeader)`
  flex: 1 1 15em;
`

const DurationDaysHeader = styled(BaseHeader)`
  flex: 0 0 7.8em;
`

const DueDateHeader = styled(BaseHeader)`
  flex: 0 0 17.5em;
`

const TitleCell = styled.div`
  display: flex;
  flex: 2 1 40em;

  input {
    margin-left: 7px;
  }
`

const AssigneeCell = styled.div`
  flex: 1 1 15em;
  justify-content: flex-start;
  flex-direction: column;
  align-items: start;
`

const DueDateCell = styled.div`
  flex: 0 0 7.8em;
  justify-content: flex-start;
  position: relative;
`

const StatusCell = styled.div`
  flex: 0 1 15em;
  justify-content: flex-start;
`

const StatusActionCell = styled.div`
  flex: 0 1 15em;
  justify-content: flex-start;
  background: none !important;
`

const DurationDaysCell = styled.div`
  flex: 0 1 10em;
  justify-content: flex-start;
  position: relative;
`

const Handle = styled.div`
  align-items: center;
  display: flex;
  flex: 0 0 ${grid(3)};
  height: ${grid(5)};
  justify-content: center;
  width: ${grid(3)};
`

const DragIcon = styled(DragVerticalIcon)`
  height: 20px;
  stroke: ${th('colorTextPlaceholder')};
  stroke-width: 1.8;
  width: 20px;

  &:hover {
    stroke: ${th('colorPrimary')};
  }
`

const Ellipsis = styled(EllipsisIcon)`
  cursor: pointer;
  height: 20px;
  width: 20px;

  &:hover path {
    fill: ${th('colorPrimary')};
  }
`

const DaysNoteContainer = styled.div`
  position: absolute;
  transform: translate(4px, 16px);
`

const ModalContainer = styled(LooseColumn)`
  background-color: ${th('colorBackground')};
  padding: ${grid(2.5)} ${grid(3)};
  z-index: 10000;
`

const TaskMetaModalContainer = styled(LooseColumn)`
  background-color: ${th('colorBackground')};
  padding: ${grid(2.5)} ${grid(3)};
  width: 1200px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 480px;
  z-index: 10000;
`

const ActionDialog = styled.div`
  background: #ffffff;
  box-shadow: 0px 0px 8px rgba(0, 0, 0, 0.25);
  left: -80px;
  padding: 15px;
  position: absolute;
  top: 15px;
  z-index: 9999;
`

const EditLabel = styled.p`
  cursor: pointer;
  margin-bottom: 15px;
  padding-left: 10px;
`

const DeleteLabel = styled.p`
  cursor: pointer;
  padding-left: 10px;
`

const TaskAction = styled.div`
  cursor: pointer;
  position: relative;
`

const calculateDaysDifference = (a, b) => {
  const aMidnight = new Date(a)
  aMidnight.setHours(0)
  aMidnight.setMinutes(0)
  aMidnight.setSeconds(0)
  const bMidnight = new Date(b)
  bMidnight.setHours(0)
  bMidnight.setMinutes(0)
  bMidnight.setSeconds(0)
  return Math.round((bMidnight - aMidnight) / (24 * 60 * 60 * 1000))
}

export const TaskHeader = ({ editAsTemplate }) => {
  return (
    <TaskHeaderRow>
      <TitleHeader>Task title</TitleHeader>
      <AssigneeHeader>Assignee</AssigneeHeader>
      {editAsTemplate ? (
        <>
          <DurationDaysHeader>Duration (days)</DurationDaysHeader>
        </>
      ) : (
        <>
          <DueDateHeader>Due date</DueDateHeader>
        </>
      )}
    </TaskHeaderRow>
  )
}

const getLocalTimeString = val => {
  const date = new Date(val)
  const tzOffset = -date.getTimezoneOffset() // getTimezoneOffset gives an inverted value (a POSIX compliance thing)
  const sign = tzOffset >= 0 ? '+' : '-'
  const tzOffsetWholeHours = Math.abs(Math.trunc(tzOffset / 60))
  const tzOffsetMinutes = Math.abs(tzOffset % 60)

  const tzString =
    tzOffset === 0
      ? 'GMT'
      : `GMT${sign}${tzOffsetWholeHours}${
          tzOffsetMinutes ? `:${tzOffsetMinutes}` : ''
        }`

  return `${moment(date).format('YYYY-MM-DD HH:mm')} local time (${tzString})`
}

const Task = ({
  task: propTask,
  index,
  updateTask,
  assigneeGroupedOptions,
  onCancel,
  onDelete,
  isReadOnly,
  editAsTemplate,
  recipientGroupedOptions,
  updateTaskNotification,
  deleteTaskNotification,
}) => {
  const config = useContext(ConfigContext)
  const themeContext = useContext(ThemeContext)
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)
  const [isEditTaskMetaModal, setIsEditTaskMetaModal] = useState(false)
  const [isActionDialog, setIsActionDialog] = useState(false)

  const taskRef = useRef()

  const [task, setTask] = useState(propTask)

  useEffect(() => {
    setTask(propTask)
  }, [propTask])

  const [transposedDueDate, setTransposedDueDate] = useState(
    transposeFromTimezoneToLocal(
      task.dueDate || new Date(),
      config.teamTimezone,
    ),
  )

  const dueDateLocalString = getLocalTimeString(moment(task.dueDate))

  const transposedEndOfToday = moment(
    transposeFromTimezoneToLocal(new Date(), config.teamTimezone),
  )
    .endOf('day')
    .toDate()

  useEffect(() => {
    const checkIfClickedOutside = e => {
      if (
        isActionDialog &&
        taskRef.current &&
        !taskRef.current.contains(e.target)
      ) {
        setIsActionDialog(false)
      }
    }

    document.addEventListener('click', checkIfClickedOutside)

    return () => {
      document.removeEventListener('click', checkIfClickedOutside)
    }
  }, [isActionDialog])

  const daysDifference = calculateDaysDifference(
    transposedEndOfToday,
    transposedDueDate,
  )

  let daysDifferenceLabel = 'Today'
  if (daysDifference !== 0)
    daysDifferenceLabel =
      Math.abs(daysDifference) +
      (Math.abs(daysDifference) === 1 ? ' day' : ' days') +
      (daysDifference < 0 ? ' ago' : '')

  const displayDefaultDurationDaysUnit =
    task.defaultDurationDays && task.defaultDurationDays === 1
      ? ' day'
      : ' days'

  const displayDefaultDurationDays = task.defaultDurationDays
    ? `${task.defaultDurationDays}${displayDefaultDurationDaysUnit}`
    : ''

  const dueDateLabel = moment
    .tz(task.dueDate, config.teamTimezone)
    .format('YYYY-MM-DD')

  const isDone = task.status === 'Done'

  const isOverdue = task.dueDate
    ? Date.now() > new Date(task.dueDate).getTime() &&
      !isDone &&
      !editAsTemplate
    : false

  const [updateTaskStatus] = useMutation(UPDATE_TASK_STATUS, {
    refetchQueries: ['getTasksQuery'],
  })

  const status = {
    NOT_STARTED: 'Not started',
    START: 'Start',
    IN_PROGRESS: 'In progress',
    PAUSED: 'Paused',
    DONE: 'Done',
  }

  useEffect(() => {
    if (task.dueDate) {
      setTransposedDueDate(
        transposeFromTimezoneToLocal(
          task.dueDate || new Date(),
          config.teamTimezone,
        ),
      )
    }
  }, [task])

  if (isReadOnly)
    return (
      <TaskRow isOverdue={isOverdue}>
        <TitleCell>
          <Handle />
          <Handle>
            {isDone ? (
              <CheckCircle color={themeContext.colorPrimary} />
            ) : (
              <Circle color={themeContext.colorBorder} />
            )}
          </Handle>
          <TextInput isReadOnly value={task.title} />
        </TitleCell>
        <AssigneeCell>{task.assignee?.username}</AssigneeCell>
        {editAsTemplate ? (
          <>
            <DurationDaysCell>{task.defaultDurationDays || 0}</DurationDaysCell>
          </>
        ) : (
          <>
            <DueDateCell title={dueDateLocalString}>
              <DaysNoteContainer>
                <CompactDetailLabel isWarning={isOverdue}>
                  {daysDifferenceLabel}
                </CompactDetailLabel>
              </DaysNoteContainer>
              {dueDateLabel}
            </DueDateCell>
            <StatusCell isOverdue={isOverdue}>{task.status}</StatusCell>
          </>
        )}
      </TaskRow>
    )

  return (
    <Draggable draggableId={task.id} index={index} key={task.id}>
      {(provided, snapshot) => (
        <>
          <Modal isOpen={isConfirmingDelete}>
            <ModalContainer>
              Permanently delete this task?
              <MediumRow>
                <ActionButton onClick={() => onDelete(task.id)} primary>
                  Ok
                </ActionButton>
                &nbsp;
                <ActionButton onClick={() => setIsConfirmingDelete(false)}>
                  Cancel
                </ActionButton>
              </MediumRow>
            </ModalContainer>
          </Modal>
          <Modal isOpen={isEditTaskMetaModal}>
            <TaskMetaModalContainer>
              <TaskMeta
                assigneeGroupedOptions={assigneeGroupedOptions}
                config={config}
                daysDifferenceLabel={daysDifferenceLabel}
                deleteTaskNotification={deleteTaskNotification}
                displayDefaultDurationDays={displayDefaultDurationDays}
                dueDateLocalString={dueDateLocalString}
                editAsTemplate={editAsTemplate}
                index
                isOverdue={isOverdue}
                isReadOnly={isReadOnly}
                onCancel
                onDelete
                recipientGroupedOptions={recipientGroupedOptions}
                ref={provided.innerRef}
                status={status}
                task={task}
                transposedDueDate={transposedDueDate}
                transposedEndOfToday={transposedEndOfToday}
                updateTask={updateTask}
                updateTaskNotification={updateTaskNotification}
              />
              <MediumRow>
                <ActionButton
                  onClick={() => setIsEditTaskMetaModal(false)}
                  primary
                >
                  Save
                </ActionButton>
                &nbsp;
                <ActionButton onClick={() => setIsEditTaskMetaModal(false)}>
                  Cancel
                </ActionButton>
              </MediumRow>
            </TaskMetaModalContainer>
          </Modal>
          <TaskRowContainer>
            <TaskHeader editAsTemplate={editAsTemplate} />
            <TaskRow
              isOverdue={isOverdue}
              ref={provided.innerRef}
              {...provided.draggableProps}
            >
              <TitleCell>
                <Handle {...provided.dragHandleProps}>
                  <DragIcon />
                </Handle>
                {editAsTemplate ? (
                  <Handle />
                ) : (
                  <Handle
                    onClick={() =>
                      updateTask(task.id, {
                        ...task,
                        status: isDone ? 'In progress' : 'Done',
                      })
                    }
                    title={isDone ? '' : 'Click to mark as done'}
                  >
                    {isDone ? (
                      <CheckCircle color={themeContext.colorPrimary} />
                    ) : (
                      <Circle color={themeContext.colorBorder} />
                    )}
                  </Handle>
                )}
                <TextInput
                  onChange={event => updateTask(task.id, { ...task, title: event.target.value })}
                  placeholder="Give your task a name..."
                  value={task.title}
                />
                <TaskAction ref={taskRef}>
                  <MinimalButton
                    onClick={() => {
                      setIsActionDialog(!isActionDialog)
                    }}
                  >
                    <Ellipsis height="24" width="24" />
                  </MinimalButton>
                  {isActionDialog && (
                    <ActionDialog>
                      <EditLabel onClick={() => setIsEditTaskMetaModal(true)}>
                        Edit
                      </EditLabel>
                      <DeleteLabel onClick={() => setIsConfirmingDelete(true)}>
                        Delete
                      </DeleteLabel>
                    </ActionDialog>
                  )}
                </TaskAction>
              </TitleCell>
              <AssigneeDropdown
                assigneeGroupedOptions={assigneeGroupedOptions}
                isList
                task={task}
                updateTask={updateTask}
              />

              {editAsTemplate ? (
                <>
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
                </>
              ) : (
                <>
                  <DueDateField
                    displayDefaultDurationDays={displayDefaultDurationDays}
                    dueDateLocalString={dueDateLocalString}
                    isList
                    task={task}
                    transposedDueDate={transposedDueDate}
                    transposedEndOfToday={transposedEndOfToday}
                    updateTask={updateTask}
                  />
                  <StatusActionCell>
                    <StatusDropdown task={task} onStatusUpdate={setTask} />
                  </StatusActionCell>
                </>
              )}
            </TaskRow>
          </TaskRowContainer>
        </>
      )}
    </Draggable>
  )
}

Task.propTypes = {
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
  onDelete: PropTypes.func.isRequired,
  updateTask: PropTypes.func.isRequired,
}

Task.defaultProps = {
  onCancel: () => {},
}

export default Task
