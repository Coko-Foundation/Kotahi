import React, { useState, useContext } from 'react'
import PropTypes from 'prop-types'
import styled, { ThemeContext, css } from 'styled-components'
import { Draggable } from 'react-beautiful-dnd'
import { Circle, CheckCircle, Trash2 } from 'react-feather'
import { th, grid } from '@pubsweet/ui-toolkit'
import lightenBy from '../../../shared/lightenBy'
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

const TaskRow = styled.div`
  display: flex;
  gap: ${grid('1')};

  & > div {
    align-items: center;
    background: linear-gradient(0deg, transparent, ${th('colorBackgroundHue')});
    display: flex;
    height: ${grid(6)};
    padding: 0 ${grid(2)};
  }

  ${props =>
    props.isOverdue
      ? css`
          & > div:last-child {
            background: ${lightenBy('colorError', 0.5)};
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
    height: ${grid(3)};
    line-height: ${th('lineHeightBaseSmall')};
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
  flex: 0 1 12em;
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
  flex: 0 0 ${grid(4)};
  height: ${grid(5)};
  justify-content: center;
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
  { label: "Won't do", value: "Won't do" },
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
  const themeContext = useContext(ThemeContext)
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)

  const today = new Date()
  today.setHours(17) // Use 5pm local time for deadlines.
  today.setMinutes(0)
  today.setSeconds(0)

  const daysDifference = calculateDaysDifference(today, task.dueDate)
  let daysDifferenceLabel = 'Today'
  if (daysDifference !== 0)
    daysDifferenceLabel =
      Math.abs(daysDifference) +
      (Math.abs(daysDifference) === 1 ? ' day' : ' days') +
      (daysDifference < 0 ? ' ago' : '')

  const isOverdue =
    daysDifference < 0 &&
    ['Not started', 'In progress'].includes(task.status) &&
    !task.isComplete &&
    !editAsTemplate

  if (isReadOnly)
    return (
      <TaskRow isOverdue={isOverdue}>
        <TitleCell>
          <Handle />
          <Handle>
            {task.isComplete ? (
              <CheckCircle color={themeContext.colorPrimary} />
            ) : (
              <Circle color={themeContext.colorBorder} />
            )}
          </Handle>
          <MinimalTextInput isReadOnly value={task.title} />
        </TitleCell>
        <AssigneeCell>{task.assignee?.username}</AssigneeCell>
        {editAsTemplate ? (
          <>
            <DurationDaysCell>{task.defaultDurationDays || 0}</DurationDaysCell>
          </>
        ) : (
          <>
            <DueDateCell>
              <DaysNoteContainer>
                <CompactDetailLabel isWarning={isOverdue}>
                  {daysDifferenceLabel}
                </CompactDetailLabel>
              </DaysNoteContainer>
              {new Date(task.dueDate).toISOString().split('T')[0]}
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
                      isComplete: !task.isComplete,
                    })
                  }
                  title={task.isComplete ? '' : 'Click to mark as complete'}
                >
                  {task.isComplete ? (
                    <CheckCircle color={themeContext.colorPrimary} />
                  ) : (
                    <Circle color={themeContext.colorBorder} />
                  )}
                </Handle>
              )}
              <MinimalTextInput
                autoFocus={!task.title}
                onCancel={() => {
                  if (!task.title) onCancel()
                }}
                onChange={val => updateTask(task.id, { ...task, title: val })}
                placeholder="Give your task a name..."
                taskId={task.id}
                value={task.title}
              />
              <MinimalButton onClick={() => setIsConfirmingDelete(true)}>
                <Trash2 size={18} />
              </MinimalButton>
            </TitleCell>
            <AssigneeCell>
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
                <DueDateCell>
                  <DaysNoteContainer>
                    <CompactDetailLabel isWarning={isOverdue}>
                      {daysDifferenceLabel}
                    </CompactDetailLabel>
                  </DaysNoteContainer>
                  <MinimalDatePicker
                    clearIcon={null}
                    format="yyyy-MM-dd"
                    minDate={today}
                    onChange={val =>
                      updateTask(task.id, {
                        ...task,
                        dueDate: new Date(val),
                      })
                    }
                    position="top center"
                    value={new Date(task.dueDate)}
                  />
                </DueDateCell>
                <StatusCell isOverdue={isOverdue}>
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
    isComplete: PropTypes.bool.isRequired,
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
