import React, { useContext } from 'react'
import styled from 'styled-components'
import moment from 'moment-timezone'
import { CompactDetailLabel, MinimalDatePicker } from '../../shared'
import { ConfigContext } from '../../config/src'
import { transposeFromLocalToTimezone } from '../../../shared/dateUtils'
import theme from '../../../theme'

const BaseDueDateCell = styled.div`
  background: ${theme.colors.neutral.gray99} !important;
  border: 1px solid ${theme.colors.neutral.gray80};
  box-shadow: inset 0px 0px 4px rgba(0, 0, 0, 0.07);
  border-radius: ${theme.borderRadius};

  display: flex;
  align-items: center;
  justify-content: flex-start;
  position: relative;
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
    font-size: ${theme.fontSizeBase}
    line-height: {theme.lineHeightBase};
    letter-spacing: 0.01em;
    color: ${theme.colors.neutral.gray20};

    svg {
      margin-right: 6px;
    }
  }
`

const CompactDueDateCell = styled(BaseDueDateCell)`
  flex: 0 0 7.8em;
  min-width: 120px;
`

const DueDateField = ({
  task,
  updateTask,
  dueDateLocalString,
  displayDefaultDurationDays,
  transposedEndOfToday,
  transposedDueDate,
  compact = false,
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

  const DueDateCell = compact ? CompactDueDateCell : BaseDueDateCell

  return (
    <DueDateCell title={dueDateLocalString}>
      {task.status === status.NOT_STARTED || task.dueDate === null ? (
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
            position={position || 'top center'}
            suppressTodayHighlight
            value={transposedDueDate}
          />
        </>
      )}
    </DueDateCell>
  )
}

export default DueDateField
