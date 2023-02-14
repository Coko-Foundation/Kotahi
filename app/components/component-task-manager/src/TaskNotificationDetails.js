import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { TextField } from '@pubsweet/ui'
import SelectEmailTemplate from '../../component-review/src/components/emailNotifications/SelectEmailTemplate'
import {
  GroupedOptionsSelect,
  RoundIconButton,
  Select,
} from '../../shared'
import CounterFieldWithOptions from './CounterFieldWithOptions'
import CounterField from './CounterField'
import TextInput from './TextInput'
import SecondaryActionButton from '../../shared/SecondaryActionButton'

const TaskTitle = styled.div`
  font-family: 'Roboto';
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  line-height: 19px;
  letter-spacing: 0.01em;
  color: #323232;
  margin-bottom: 4px;
`

const TaskFieldsContainer = styled.div`
  display: flex;
  flex-direction: column;

  + div {
    margin-left: 20px;
  }
`

const RecipientFieldContainer = styled(TaskFieldsContainer)`
  flex: 0 0 20em;
`

const EmailTemplateFieldContainer = styled(TaskFieldsContainer)`
  flex: 0 0 15em;

  div {
    font-size: 16px;
  }

  > div:nth-child(2) > div:nth-child(2) {
    height: 45px;
  }
`

const ScheduleNotificationFieldContainer = styled(TaskFieldsContainer)`
  flex: 0 0 22em;
`

const SendNowActionContainer = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 22px;
`

const RoundIconButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  width: 18%;
  & > button > span {
    padding: 0;
  }
  & > button {
    min-width: 0px;
    height: 25px;
    width: 25px;
    margin-top: 25px;
  }
  & > button > svg {
    width: 18px;
  }
`

const NotificationDeadlineCell = styled.div`
  display: flex;
  align-items: center;
  height: 45px;

  & > div {
    margin: 0px 10px;
  }
`

const UnregisteredUserCell = styled.div`
  display: flex;

  > input {
    margin-top: 10px;

    + input {
      margin-left: 10px;
    }
  }
`

const NotificationDeadlineContainer = styled.div`
  display: flex;
  flex-direction: column;
`

const NotificationDetailsContainer = styled.div`
  display: flex;
  width: 100%;
  & + div {
    margin-top: 16px;
  }
`

const AssigneeCell = styled.div`
  justify-content: flex-start;
  line-height: 1em;

  > div > div {
    font-size: 16px;
    line-height: 1.25;

    &:nth-child(2) {
      height: 45px;
    }
  }
`

const TaskNotificationDetails = ({
  updateTaskNotification,
  recipientGroupedOptions,
  taskEmailNotification: propTaskEmailNotification,
  deleteTaskNotification,
  task,
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState('')

  const [taskEmailNotification, setTaskNotification] = useState(
    propTaskEmailNotification,
  )

  useEffect(() => {
    setTaskNotification(propTaskEmailNotification)
  }, [propTaskEmailNotification])

  const [recipientEmail, setRecipientEmail] = useState(
    taskEmailNotification.recipientEmail,
  )

  const [recipientName, setRecipientName] = useState(
    taskEmailNotification.recipientName,
  )

  const [isNewRecipient, setIsNewRecipient] = useState(
    taskEmailNotification.recipientType === 'unregisteredUser',
  )

  const [recipientDropdownState, setRecipientDropdownState] = useState(false)

  let notificationOption

  const notificationElapsedDays = Math.abs(
    taskEmailNotification?.notificationElapsedDays,
  )

  if (Math.sign(taskEmailNotification?.notificationElapsedDays) === -1) {
    notificationOption = 'before'
  }

  if (Math.sign(taskEmailNotification?.notificationElapsedDays) === 1) {
    notificationOption = 'after'
  }

  const [
    taskEmailNotificationDeadline,
    setTaskEmailNotificationDeadline,
  ] = useState(notificationOption)

  const [
    taskEmailNotificationElapsedDays,
    setTaskEmailNotificationElapsedDays,
  ] = useState(notificationElapsedDays)

  function handleRecipientInput(selectedOption, taskNotification) {
    setRecipientDropdownState(selectedOption)

    if (!selectedOption) {
      setIsNewRecipient(false)
      updateTaskNotification({
        ...taskNotification,
        id: taskNotification.id,
        taskId: taskNotification.taskId,
        recipientUserId: null,
        recipientType: null,
        recipientEmail: null,
        recipientName: null,
      })
      return
    }

    switch (selectedOption.key) {
      case 'userRole':
        setIsNewRecipient(false)
        updateTaskNotification({
          id: taskNotification.id,
          taskId: taskNotification.taskId,
          recipientUserId: null,
          recipientType: selectedOption.value,
          recipientEmail: null,
          recipientName: null,
        })

        break
      case 'registeredUser':
        setIsNewRecipient(false)
        updateTaskNotification({
          ...taskNotification,
          id: taskNotification.id,
          taskId: taskNotification.taskId,
          recipientUserId: selectedOption?.value,
          recipientType: 'registeredUser',
          recipientEmail: null,
          recipientName: null,
        })

        break
      case 'assignee':
        setIsNewRecipient(false)
        updateTaskNotification({
          ...taskNotification,
          id: taskNotification.id,
          taskId: taskNotification.taskId,
          recipientUserId: null,
          recipientType: 'assignee',
          recipientEmail: null,
          recipientName: null,
        })

        break
      case 'unregisteredUser':
        setIsNewRecipient(true)
        updateTaskNotification({
          ...taskNotification,
          id: taskNotification.id,
          taskId: taskNotification.taskId,
          recipientUserId: null,
          recipientType: 'unregisteredUser',
          recipientEmail: null,
          recipientName: null,
        })

        break
      default:
    }
  }

  function handleTaskNotificationDeadline(
    deadlineOption,
    elapsedDays,
    taskNotification,
  ) {
    let elapsedDaysValue = elapsedDays

    if (deadlineOption === 'before') {
      elapsedDaysValue = -Math.abs(elapsedDaysValue)
    }

    updateTaskNotification({
      ...taskNotification,
      id: taskNotification.id,
      taskId: taskNotification.taskId,
      notificationElapsedDays: elapsedDaysValue,
    })
  }

  return (
    <NotificationDetailsContainer>
      <RecipientFieldContainer>
        <TaskTitle>Recipient</TaskTitle>
        <AssigneeCell title={taskEmailNotification.recipientType}>
          <Select
            aria-label="Recipient"
            data-testid="Recipient_select"
            dropdownState={recipientDropdownState}
            label="Recipient"
            onChange={selected =>
              handleRecipientInput(selected, taskEmailNotification)
            }
            options={recipientGroupedOptions}
            placeholder="Select a recipient"
            value={
              taskEmailNotification?.recipientUserId ||
              taskEmailNotification?.recipientType
            }
            isClearable
          />
        </AssigneeCell>
        {isNewRecipient && (
          <UnregisteredUserCell>
            <TextInput
              onChange={e => {
                setRecipientEmail(e.target.value)
                updateTaskNotification({
                  ...taskEmailNotification,
                  recipientUserId: null,
                  recipientType: 'unregisteredUser',
                  recipientEmail: e.target.value,
                })
              }}
              placeholder="Email"
              value={recipientEmail}
            />
            <TextInput
              onChange={e => {
                setRecipientName(e.target.value)
                updateTaskNotification({
                  ...taskEmailNotification,
                  recipientUserId: null,
                  recipientType: 'unregisteredUser',
                  recipientName: e.target.value,
                })
              }}
              placeholder="Name"
              value={recipientName}
            />
          </UnregisteredUserCell>
        )}
      </RecipientFieldContainer>
      <EmailTemplateFieldContainer>
        <TaskTitle>Select email template</TaskTitle>
        <SelectEmailTemplate
          isTaskEmailNotification
          onChangeEmailTemplate={setSelectedTemplate}
          selectedEmailTemplate={
            selectedTemplate || taskEmailNotification.emailTemplateKey
          }
          task={task}
          taskEmailNotification={taskEmailNotification}
          updateTaskNotification={updateTaskNotification}
          placeholder="Select email template"
          isClearable
        />
      </EmailTemplateFieldContainer>
      <ScheduleNotificationFieldContainer>
        <NotificationDeadlineContainer>
          <TaskTitle>Send notification</TaskTitle>

          <NotificationDeadlineCell>
            <span>Send</span>
            <CounterField
              minValue={0}
              value={taskEmailNotificationElapsedDays || 0}
              compact={true}
              onChange={val => {
                // if (val) {
                //   setTaskEmailNotificationElapsedDays(val)
                //   handleTaskNotificationDeadline(
                //     taskEmailNotificationDeadline,
                //     val,
                //     taskEmailNotification,
                //   )
                // }
              }}
            />
            <span>days</span>
            <CounterFieldWithOptions
              value={taskEmailNotificationDeadline || 'before'}
              options={[
                {label: 'Before', value: 'before'},
                {label: 'After', value: 'after'},
              ]}
              onChange={selected => {
                // if (selected && selected.value) {
                //   setTaskEmailNotificationDeadline(selected.value)
                //   handleTaskNotificationDeadline(
                //     selected.value,
                //     taskEmailNotificationElapsedDays,
                //     taskEmailNotification,
                //   )
                // }
              }}
            />
            <span>due date</span>
          </NotificationDeadlineCell>
        </NotificationDeadlineContainer>
      </ScheduleNotificationFieldContainer>
      <SendNowActionContainer>
        <SecondaryActionButton>Send Now</SecondaryActionButton>
      </SendNowActionContainer>
      <RoundIconButtonContainer>
        <RoundIconButton
          iconName="Minus"
          onClick={() =>
            deleteTaskNotification({
              variables: { id: taskEmailNotification.id },
            })
          }
          secondary
          title="Delete Notification"
        />
      </RoundIconButtonContainer>
    </NotificationDetailsContainer>
  )
}

export default TaskNotificationDetails
