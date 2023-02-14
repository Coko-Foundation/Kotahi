import React, { useContext } from 'react'
import styled from 'styled-components'
import moment from 'moment-timezone'
import { CompactDetailLabel, MinimalDatePicker } from '../../shared'
import { ConfigContext } from '../../config/src'
import { transposeFromLocalToTimezone } from '../../../shared/dateUtils'

const BaseDueDateCell = styled.div`
  background: #F8F8F9 !important;
  border: 1px solid #DEDEDE;
  box-shadow: inset 0px 0px 4px rgba(0, 0, 0, 0.25);
  border-radius: 5px;

  align-items: center;
  display: flex;
  line-height: 1em;
  min-height: 45px;

  > div {
    width: 100%;
  }

  button {
    width: 100%;
    display: flex;
    flex-direction: row-reverse;
    justify-content: space-around;
    font-size: 16px;
    line-height: 20px;
    letter-spacing: 0.01em;
    color: #323232;
  }
`

const TaskListDueDateCell = styled(BaseDueDateCell)`
  flex: 0 0 7.8em;
  justify-content: flex-start;
  position: relative;
`

const TaskMetaDueDateCell = styled(BaseDueDateCell)`
  justify-content: flex-start;
  position: relative;
`

const DueDateField = ({
  task,
  updateTask,
  dueDateLocalString,
  displayDefaultDurationDays,
  transposedEndOfToday,
  transposedDueDate,
  isList = false,
  position,
}) => {
  const config = useContext(ConfigContext)

  const status = {
    NOT_STARTED: 'Not started',
    START: 'Start',
    IN_PROGRESS: 'In progress',
    PAUSED: 'Paused',
    DONE: 'Done',
  }

  const DueDateCell = isList ? TaskListDueDateCell : TaskMetaDueDateCell

  return (
    <DueDateCell title={dueDateLocalString}>
      {task.status === status.NOT_STARTED ? (
        <CompactDetailLabel>{displayDefaultDurationDays}</CompactDetailLabel>
      ) : (
        <>
          <MinimalDatePicker
            clearIcon={null}
            format="yyyy-MM-dd"
            minDate={transposedEndOfToday}
            onChange={val =>
              updateTask(task.id, {
                ...task,
                dueDate: moment
                  .tz(
                    transposeFromLocalToTimezone(val, config.teamTimezone),
                    config.teamTimezone,
                  )
                  .endOf('day')
                  .toDate(),
              })
            }
            position={position || "top center"}
            suppressTodayHighlight
            value={transposedDueDate}
          />
        </>
      )}
    </DueDateCell>
  )
}

export default DueDateField
