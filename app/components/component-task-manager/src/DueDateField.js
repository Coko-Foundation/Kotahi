import React, { useContext } from 'react'
import styled from 'styled-components'
import {
  CompactDetailLabel,
  MinimalDatePicker,
} from '../../shared'
import { ConfigContext } from '../../config/src'
import {
  transposeFromLocalToTimezone,
} from '../../../shared/dateUtils'
import moment from 'moment-timezone'

const TaskListDueDateCell = styled.div`
  flex: 0 0 7.8em;
  justify-content: flex-start;
  position: relative;
`

const TaskMetaDueDateCell = styled.div`
  justify-content: flex-start;
  position: relative;
`

const DueDateField = ({ task, updateTask, dueDateLocalString, displayDefaultDurationDays, transposedEndOfToday, transposedDueDate, isList = false }) => {

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
        <CompactDetailLabel>
          {displayDefaultDurationDays}
        </CompactDetailLabel>
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
        </>
      )}
    </DueDateCell>
  )
}

export default DueDateField
