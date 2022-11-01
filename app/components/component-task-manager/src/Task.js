import React, { useState, useContext } from 'react'
import PropTypes from 'prop-types'
import moment from 'moment-timezone'
import styled, { ThemeContext, css } from 'styled-components'
import { Draggable } from 'react-beautiful-dnd'
import { Circle, CheckCircle, Trash2 } from 'react-feather'
import { th, grid } from '@pubsweet/ui-toolkit'
import {
  transposeFromLocalToTimezone,
  transposeFromTimezoneToLocal,
} from '../../../shared/dateUtils'
import {
  MinimalTextInput,
  MinimalSelect,
  MinimalDatePicker,
  MinimalButton,
  MinimalNumericUpDown,
  CompactDetailLabel,
  ActionButton,
  LooseColumn,
  MediumRow,
} from '../../shared'
import { DragVerticalIcon } from '../../shared/Icons'
import Modal from '../../component-modal/src'
import { ConfigContext } from '../../config/src'

const TextInput = styled(MinimalTextInput)`
  margin-left: ${grid(0.5)};
`

const TaskRow = styled.div`
  align-items: stretch;
  display: flex;
  gap: ${grid('1')};

  & > div {
    align-items: center;
    background: linear-gradient(0deg, transparent, ${th('colorBackgroundHue')});
    display: flex;
    line-height: 1em;
    min-height: ${grid(6)};
    padding: ${grid(1)} ${grid(0.5)};
  }

  ${props =>
    props.isOverdue
      ? css`
          & > div:last-child {
            border-right: ${grid(1)} solid ${th('colorError')};
          }
        `
      : ''}

  & > div:first-child > div:first-child > svg,
  & > div:first-child > button:last-child > svg {
    display: none;
  }

  &:hover > div:first-child > div:first-child > svg,
  &:hover > div:first-child > button:last-child > svg {
    display: block;
  }
`

/* stylelint-disable no-descending-specificity */
const TaskHeaderRow = styled(TaskRow)`
  & > div {
    background: none;
    color: ${th('colorBorder')};
    font-size: ${th('fontSizeBaseSmall')};
    font-variant: all-small-caps;
    line-height: ${th('lineHeightBaseSmall')};
    min-height: ${grid(3)};
  }
`
/* stylelint-enable no-descending-specificity */

const TitleCell = styled.div`
  display: flex;
  flex: 2 1 40em;
`

const AssigneeCell = styled.div`
  flex: 1 1 15em;
  justify-content: flex-start;
`

const DueDateCell = styled.div`
  flex: 0 0 7.6em;
  justify-content: flex-start;
  position: relative;
`

const StatusCell = styled.div`
  flex: 0 1 15em;
  justify-content: flex-start;
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

const DaysNoteContainer = styled.div`
  position: absolute;
  transform: translate(4px, 16px);
`

const ModalContainer = styled(LooseColumn)`
  background-color: ${th('colorBackground')};
  padding: ${grid(2.5)} ${grid(3)};
  z-index: 10000;
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

const statusOptions = [
  { label: 'Not started', value: 'Not started' },
  { label: 'In progress', value: 'In progress' },
  { label: 'Done', value: 'Done' },
]

export const TaskHeader = ({ editAsTemplate }) => {
  return (
    <TaskHeaderRow>
      <TitleCell>
        <Handle />
        <Handle />
        Title
      </TitleCell>
      <AssigneeCell>Assignee</AssigneeCell>
      {editAsTemplate ? (
        <>
          <DurationDaysCell>Duration (days)</DurationDaysCell>
        </>
      ) : (
        <>
          <DueDateCell>Due date</DueDateCell>
          <StatusCell>Status</StatusCell>
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
  task,
  index,
  updateTask,
  userOptions,
  onCancel,
  onDelete,
  isReadOnly,
  editAsTemplate,
}) => {
  const config = useContext(ConfigContext)
  const themeContext = useContext(ThemeContext)
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)

  const dueDateLocalString = getLocalTimeString(moment(task.dueDate))

  const transposedDueDate = transposeFromTimezoneToLocal(
    task.dueDate,
    config.teamTimezone,
  )

  const transposedEndOfToday = moment
    .tz(
      transposeFromTimezoneToLocal(new Date(), config.teamTimezone),
      config.teamTimezone,
    )
    .endOf('day')
    .toDate()

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

  const dueDateLabel = moment
    .tz(task.dueDate, config.teamTimezone)
    .format('YYYY-MM-DD')

  const isDone = task.status === 'Done'
  const isOverdue = daysDifference < 0 && !isDone && !editAsTemplate

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
                autoFocus={!task.title}
                onCancel={() => {
                  if (!task.title) onCancel()
                }}
                onChange={val => updateTask(task.id, { ...task, title: val })}
                placeholder="Give your task a name..."
                taskId={task.id}
                title={task.title}
                value={task.title}
              />
              <MinimalButton onClick={() => setIsConfirmingDelete(true)}>
                <Trash2 size={18} />
              </MinimalButton>
            </TitleCell>
            <AssigneeCell title={task.assignee?.username}>
              <MinimalSelect
                aria-label="Assignee"
                data-testid="Assignee_select"
                isClearable
                label="Assignee"
                onChange={selected =>
                  updateTask(task.id, {
                    ...task,
                    assigneeUserId: selected?.value,
                    assignee: selected?.user,
                  })
                }
                options={userOptions}
                placeholder="Assign a user"
                value={task.assignee?.id}
              />
            </AssigneeCell>
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
                <DueDateCell title={dueDateLocalString}>
                  <DaysNoteContainer>
                    <CompactDetailLabel isWarning={isOverdue}>
                      {daysDifferenceLabel}
                    </CompactDetailLabel>
                  </DaysNoteContainer>
                  <MinimalDatePicker
                    clearIcon={null}
                    format="yyyy-MM-dd"
                    minDate={transposedEndOfToday}
                    onChange={val =>
                      updateTask(task.id, {
                        ...task,
                        dueDate: moment
                          .tz(
                            transposeFromLocalToTimezone(
                              val,
                              config.teamTimezone,
                            ),
                            config.teamTimezone,
                          )
                          .endOf('day')
                          .toDate(),
                      })
                    }
                    position="top center"
                    suppressTodayHighlight
                    value={transposedDueDate}
                  />
                </DueDateCell>
                <StatusCell isOverdue={isOverdue} title={task.status}>
                  <MinimalSelect
                    aria-label="Assignee"
                    data-testid="Assignee_select"
                    label="Assignee"
                    onChange={selected =>
                      updateTask(task.id, {
                        ...task,
                        status: selected.value,
                      })
                    }
                    options={statusOptions}
                    placeholder="Assign a user"
                    value={task.status}
                  />
                </StatusCell>
              </>
            )}
          </TaskRow>
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
  userOptions: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.node.isRequired,
      value: PropTypes.string,
      user: PropTypes.shape({
        id: PropTypes.string.isRequired,
        username: PropTypes.string.isRequired,
      }).isRequired,
    }),
  ).isRequired,
}

Task.defaultProps = {
  onCancel: () => {},
}

export default Task
