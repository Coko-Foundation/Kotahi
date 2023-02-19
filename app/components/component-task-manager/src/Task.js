import React, {
  useState,
  useEffect,
  useContext,
  useRef,
  useCallback,
} from 'react'
import PropTypes from 'prop-types'
import moment from 'moment-timezone'
import styled, { ThemeContext, css } from 'styled-components'
import { Draggable } from 'react-beautiful-dnd'
import { Circle, CheckCircle } from 'react-feather'
import { th, grid } from '@pubsweet/ui-toolkit'
// import { useMutation } from '@apollo/client'
import { debounce } from 'lodash'
import { transposeFromTimezoneToLocal } from '../../../shared/dateUtils'
import {
  MinimalButton,
  // MinimalNumericUpDown,
  CompactDetailLabel,
  ActionButton,
  LooseColumn,
  MediumRow,
  TextInput,
} from '../../shared'

import { DragVerticalIcon, EllipsisIcon } from '../../shared/Icons'
import Modal from '../../component-modal/src'
import { ConfigContext } from '../../config/src'
// import { UPDATE_TASK_STATUS } from '../../../queries'
import AssigneeDropdown from './AssigneeDropdown'
import DueDateField from './DueDateField'
import StatusDropdown from './StatusDropdown'
import TaskEditModal from './TaskEditModal'
import CounterField from '../../shared/CounterField'

const TaskRow = styled.div`
  align-items: flex-start;
  display: flex;
  gap: ${grid('1')};

  &:hover > div:first-child > div:first-child > svg,
  &:hover > div:first-child > button:last-child > svg {
    display: block;
  }
`

const TaskRowContainer = styled.div`
  padding-top: 10px;
  padding-bottom: 15px;
  padding-left: 8px;
  padding-right: 8px;

  & + div {
    border-top: 2px solid rgba(191, 191, 191, 0.5);
  }
`

const BaseHeader = styled.div`
  font-weight: 500;
  margin-bottom: 4px;
`

const TitleHeader = styled(BaseHeader)`
  padding-left: 3.5em;
`

const AssigneeHeader = styled(BaseHeader)``

const DurationDaysHeader = styled(BaseHeader)``

const DueDateHeader = styled(BaseHeader)``

const TitleCell = styled.div`
  display: flex;

  input {
    margin-left: 7px;
  }
`

const AssigneeCell = styled.div`
  justify-content: flex-start;
  flex-direction: column;
  align-items: start;
`

const DueDateCell = styled.div`
  justify-content: flex-start;
  position: relative;
`

const StatusCell = styled.div`
  justify-content: flex-start;
`

const StatusActionCell = styled.div`
  flex: 0 1 12em;
  justify-content: flex-start;
  background: none !important;
  padding-right: ${grid(1)};
  border-right: ${grid(1)} solid transparent;

  ${props =>
    props.isOverdue
      ? css`
          border-right-color: ${th('colorError')};
        `
      : ''}
`

const DurationDaysCell = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  position: relative;
  height: 45px;
  line-height: 1.5;
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

const ActionDialog = styled.div`
  background: white;
  box-shadow: 0px 0px 8px rgba(0, 0, 0, 0.25);
  left: -80px;
  position: absolute;
  top: 15px;
  z-index: 9999;
  border-radius: 6px;
`

const BaseLabel = styled.div`
  cursor: pointer;
  padding: 12px 20px;

  &:first-child {
    border-top-left-radius: 6px;
    border-top-right-radius: 6px;
  }
  &:last-child {
    border-bottom-left-radius: 6px;
    border-bottom-right-radius: 6px;
  }

  &:hover,
  &:focus {
    background-color: #efefef;
  }
`

const EditLabel = styled(BaseLabel)``
const DeleteLabel = styled(BaseLabel)``

const TaskAction = styled.div`
  cursor: pointer;
  position: relative;
  display: flex;
`

const BaseFieldContainer = styled.div`
  display: flex;
  flex-direction: column;
  background: transparent;
  line-height: 1em;
  /* align-items: flex-start; */
`

const TitleFieldContainer = styled(BaseFieldContainer)`
  flex: 1 1 40em;
`

const AssigneeFieldContainer = styled(BaseFieldContainer)`
  flex: 1 1 15em;
`

const DurationDaysFieldContainer = styled(BaseFieldContainer)`
  flex: 0 0 10em;
  margin-left: 10px;
`

const DueDateFieldContainer = styled(BaseFieldContainer)`
  flex: 0 0 16em;
  flex-direction: row;
  align-items: flex-end;

  > div + div {
    margin-left: ${grid(1)};
  }
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
  currentUser,
  manuscript,
  sendNotifyEmail,
  createTaskEmailNotificationLog,
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

  const [taskTitle, setTaskTitle] = useState(task?.title || '')

  useEffect(() => {
    setTaskTitle(task.title)
  }, [task])

  const updateTaskDebounce = useCallback(
    debounce(updateTask ?? (() => {}), 1000),
    [],
  )

  const updateTaskTitle = value => {
    setTaskTitle(value)
    updateTaskDebounce(task.id, { ...task, title: value })
  }

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

  let displayDefaultDurationDaysUnit

  if (task.defaultDurationDays === 'None') {
    displayDefaultDurationDaysUnit = ''
  } else {
    displayDefaultDurationDaysUnit =
      task.defaultDurationDays && task.defaultDurationDays === 1
        ? ' day'
        : ' days'
  }

  const displayDefaultDurationDays = task.defaultDurationDays
    ? `${task.defaultDurationDays}${displayDefaultDurationDaysUnit}`
    : ''

  const dueDateLabel = moment
    .tz(task.dueDate, config.teamTimezone)
    .format('YYYY-MM-DD')

  const isDone = task.status === 'Done'

  const isOverdue = task.dueDate
    ? Date.now() > new Date(task.dueDate).getTime() &&
      task.status === 'In progress' &&
      !editAsTemplate
    : false

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
        <div>
          <TitleHeader>Task title</TitleHeader>
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
        </div>
        <div>
          <AssigneeHeader>Assignee</AssigneeHeader>
          <AssigneeCell>{task.assignee?.username}</AssigneeCell>
        </div>
        <AssigneeHeader>Assignee</AssigneeHeader>
        {editAsTemplate ? (
          <div>
            <DurationDaysHeader>Duration in days</DurationDaysHeader>
            <DurationDaysCell>{task.defaultDurationDays || 0}</DurationDaysCell>
          </div>
        ) : (
          <div>
            <DueDateHeader>Due date</DueDateHeader>
            <DueDateCell title={dueDateLocalString}>
              <DaysNoteContainer>
                <CompactDetailLabel isWarning={isOverdue}>
                  {daysDifferenceLabel}
                </CompactDetailLabel>
              </DaysNoteContainer>
              {dueDateLabel}
            </DueDateCell>
            <StatusCell isOverdue={isOverdue}>{task.status}</StatusCell>
          </div>
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
          <TaskEditModal
            assigneeGroupedOptions={assigneeGroupedOptions}
            config={config}
            createTaskEmailNotificationLog={createTaskEmailNotificationLog}
            currentUser={currentUser}
            daysDifferenceLabel={daysDifferenceLabel}
            deleteTaskNotification={deleteTaskNotification}
            displayDefaultDurationDays={displayDefaultDurationDays}
            dueDateLocalString={dueDateLocalString}
            editAsTemplate={editAsTemplate}
            isOpen={isEditTaskMetaModal}
            isOverdue={isOverdue}
            isReadOnly={isReadOnly}
            manuscript={manuscript}
            onCancel={setIsEditTaskMetaModal}
            onSave={setIsEditTaskMetaModal}
            recipientGroupedOptions={recipientGroupedOptions}
            sendNotifyEmail={sendNotifyEmail}
            status={status}
            task={task}
            transposedDueDate={transposedDueDate}
            transposedEndOfToday={transposedEndOfToday}
            updateTask={updateTask}
            updateTaskNotification={updateTaskNotification}
          />
          <TaskRowContainer>
            <TaskRow
              isOverdue={isOverdue}
              ref={provided.innerRef}
              {...provided.draggableProps}
            >
              <TitleFieldContainer>
                <TitleHeader>Task title</TitleHeader>
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
                    onChange={event => updateTaskTitle(event.target.value)}
                    placeholder="Give your task a name..."
                    value={taskTitle}
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
                        <DeleteLabel
                          onClick={() => setIsConfirmingDelete(true)}
                        >
                          Delete
                        </DeleteLabel>
                      </ActionDialog>
                    )}
                  </TaskAction>
                </TitleCell>
              </TitleFieldContainer>
              <AssigneeFieldContainer>
                <AssigneeHeader>Assignee</AssigneeHeader>
                <AssigneeDropdown
                  assigneeGroupedOptions={assigneeGroupedOptions}
                  isList
                  task={task}
                  updateTask={updateTask}
                />
              </AssigneeFieldContainer>
              {editAsTemplate ? (
                <DurationDaysFieldContainer>
                  <DurationDaysHeader>Duration in days</DurationDaysHeader>
                  <DurationDaysCell>
                    <CounterField
                      minValue={0}
                      onChange={val => {
                        updateTask(task.id, {
                          ...task,
                          defaultDurationDays: val.toString(),
                        })
                      }}
                      showNone
                      value={
                        task.defaultDurationDays &&
                        task.defaultDurationDays !== 'None'
                          ? // eslint-disable-next-line radix
                            parseInt(task.defaultDurationDays)
                          : 'None'
                      }
                    />
                  </DurationDaysCell>
                </DurationDaysFieldContainer>
              ) : (
                <DueDateFieldContainer>
                  <div>
                    <DueDateHeader>Due date</DueDateHeader>
                    <DueDateField
                      displayDefaultDurationDays={displayDefaultDurationDays}
                      dueDateLocalString={dueDateLocalString}
                      isList
                      task={task}
                      transposedDueDate={transposedDueDate}
                      transposedEndOfToday={transposedEndOfToday}
                      updateTask={updateTask}
                    />
                  </div>
                  <div>
                    <StatusActionCell isOverdue={isOverdue}>
                      <StatusDropdown onStatusUpdate={setTask} task={task} />
                    </StatusActionCell>
                  </div>
                </DueDateFieldContainer>
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
