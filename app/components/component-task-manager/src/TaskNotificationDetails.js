import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { th } from '@pubsweet/ui-toolkit'
import { TextField } from '@pubsweet/ui'
import SelectEmailTemplate from '../../component-review/src/components/emailNotifications/SelectEmailTemplate'
import {
  MinimalNumericUpDown,
  GroupedOptionsSelect,
  MinimalSelect,
  RoundIconButton,
  ActionButton,
} from '../../shared'
import { convertTimestampToDateString } from '../../../shared/dateUtils'

const TaskTitle = styled.div`
  text-transform: uppercase;
  font-size: ${th('fontSizeBaseSmall')};
  font-variant: all-small-caps;
`

const TaskFieldsContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 25%;
  margin-right: 20px;
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
  & > div {
    margin: 0px 10px;
  }
`

const InputField = styled(TextField)`
  height: 40px;
  margin-bottom: 0;
`

const UnregisteredUserCell = styled.div`
  display: flex;
  & > div {
    margin: 20px 20px 0px 0px;
  }
`

const NotificationDeadlineContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 300px;
`

const NotificationDetailsContainer = styled.div`
  display: flex;
  margin-top: 40px;
  margin-bottom: 20px;
  width: 100%;
`

const AssigneeCell = styled.div`
  justify-content: flex-start;
`

const TaskNotificationDetails = ({
  updateTaskNotification,
  recipientGroupedOptions,
  notificationOptions,
  taskEmailNotification: propTaskEmailNotification,
  deleteTaskNotification,
  task,
  manuscript,
  currentUser,
  sendNotifyEmail,
  editAsTemplate,
  createTaskEmailNotificationLog,
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

  const [taskNotificationStatus, setTaskNotificationStatus] = useState(null)

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
          recipientType: 'assignee',
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

  const handleManuscriptTeamInput = (
    notificationRecipientType,
    manuscriptTeams,
  ) => {
    const teamsOfRecipientType = manuscriptTeams.filter(team => {
      if (notificationRecipientType === 'editor') {
        return ['editor', 'handlingEditor', 'seniorEditor'].includes(team.role)
      }

      return team.role === notificationRecipientType
    })

    let logsData
    const logsDataArray = []

    const prepareEmailRecipients = () => {
      return new Promise((resolve, reject) => {
        let emailSuccess = true
        let emailCount = 0

        const totalEmails = teamsOfRecipientType.reduce(
          (sum, team) => sum + team.members.length,
          0,
        )

        const promises = []

        // eslint-disable-next-line no-restricted-syntax
        for (const team of teamsOfRecipientType) {
          // eslint-disable-next-line no-restricted-syntax
          for (const member of team.members) {
            const input = {
              selectedEmail: member.user.email,
              selectedTemplate: taskEmailNotification.emailTemplateKey,
              manuscript,
              currentUser: currentUser.username,
            }

            logsData = {
              selectedTemplate: taskEmailNotification.emailTemplateKey,
              recipientName: member.user.username,
              recipientEmail: member.user.email,
              senderEmail: currentUser.email,
            }

            promises.push(
              sendNotifyEmail(input)
                // eslint-disable-next-line no-loop-func
                .then(response => {
                  const responseStatus = response.data.sendEmail.success

                  if (!responseStatus) {
                    emailSuccess = false
                    reject(new Error('Sending email failed'))
                    emailCount += 1
                  } else {
                    logsDataArray.push(logsData)
                  }

                  if (emailCount === totalEmails) {
                    resolve(emailSuccess)
                  }
                })
                // eslint-disable-next-line no-loop-func
                .catch(error => {
                  emailSuccess = false
                  reject(error)
                }),
            )
          }
        }

        Promise.all(promises).then(() => {
          resolve(emailSuccess)
        })
      })
    }

    return prepareEmailRecipients().then(emailStatus => {
      if (emailStatus) logTaskNotificationEmails(logsDataArray)
      return emailStatus
    })
  }

  const sendTaskNotificationEmailHandler = async () => {
    setTaskNotificationStatus('pending')

    if (taskEmailNotification.recipientType) {
      let input
      let response
      let responseStatus
      let logsData = []

      switch (taskEmailNotification.recipientType) {
        case 'unregisteredUser':
          input = {
            externalEmail: taskEmailNotification.recipientEmail,
            externalName: taskEmailNotification.recipientName,
            selectedTemplate: taskEmailNotification.emailTemplateKey,
            currentUser: currentUser.username,
            manuscript,
          }
          logsData = [
            {
              selectedTemplate: taskEmailNotification.emailTemplateKey,
              recipientName: taskEmailNotification.recipientName,
              recipientEmail: taskEmailNotification.recipientEmail,
              senderEmail: currentUser.email,
            },
          ]
          response = await sendNotifyEmail(input)
          responseStatus = response.data.sendEmail.success
          if (responseStatus) logTaskNotificationEmails(logsData)
          setTaskNotificationStatus(responseStatus ? 'success' : 'failure')
          break
        case 'registeredUser':
          input = {
            selectedEmail: taskEmailNotification.recipientUser.email,
            selectedTemplate: taskEmailNotification.emailTemplateKey,
            manuscript,
            currentUser: currentUser.username,
          }
          logsData = [
            {
              selectedTemplate: taskEmailNotification.emailTemplateKey,
              recipientName: taskEmailNotification.recipientUser.username,
              recipientEmail: taskEmailNotification.recipientUser.email,
              senderEmail: currentUser.email,
            },
          ]
          response = await sendNotifyEmail(input)
          responseStatus = response.data.sendEmail.success
          if (responseStatus) logTaskNotificationEmails(logsData)
          setTaskNotificationStatus(responseStatus ? 'success' : 'failure')
          break
        case 'assignee':
          switch (task.assigneeType) {
            case 'unregisteredUser':
              input = {
                externalEmail: task.assigneeEmail,
                externalName: task.assigneeName,
                selectedTemplate: taskEmailNotification.emailTemplateKey,
                currentUser: currentUser.username,
                manuscript,
              }
              logsData = [
                {
                  selectedTemplate: taskEmailNotification.emailTemplateKey,
                  recipientName: task.assigneeName,
                  recipientEmail: task.assigneeEmail,
                  senderEmail: currentUser.email,
                },
              ]
              response = await sendNotifyEmail(input)
              responseStatus = response.data.sendEmail.success
              if (responseStatus) logTaskNotificationEmails(logsData)
              setTaskNotificationStatus(responseStatus ? 'success' : 'failure')
              break
            case 'registeredUser':
              input = {
                selectedEmail: task.assginee.email,
                selectedTemplate: taskEmailNotification.emailTemplateKey,
                manuscript,
                currentUser: currentUser.username,
              }

              logsData = [
                {
                  selectedTemplate: taskEmailNotification.emailTemplateKey,
                  recipientName: task.assginee.username,
                  recipientEmail: task.assginee.email,
                  senderEmail: currentUser.email,
                },
              ]
              response = await sendNotifyEmail(input)
              responseStatus = response.data.sendEmail.success
              if (responseStatus) logTaskNotificationEmails(logsData)
              setTaskNotificationStatus(responseStatus ? 'success' : 'failure')
              break
            case 'editor':
            case 'reviewer':
            case 'author':
              responseStatus = handleManuscriptTeamInput(
                task.assigneeType,
                manuscript.teams,
              )
                .then(emailStatus => {
                  setTaskNotificationStatus(emailStatus ? 'success' : 'failure')
                })
                .catch(error => {
                  console.error(error)
                  setTaskNotificationStatus('failure')
                })
              break
            default:
          }

          break
        case 'editor':
        case 'reviewer':
        case 'author':
          responseStatus = handleManuscriptTeamInput(
            taskEmailNotification.recipientType,
            manuscript.teams,
          )
            .then(emailStatus => {
              setTaskNotificationStatus(emailStatus ? 'success' : 'failure')
            })
            .catch(error => {
              console.error(error)
              setTaskNotificationStatus('failure')
            })
          break
        default:
      }
    }
  }

  const logTaskNotificationEmails = async logsData => {
    // eslint-disable-next-line no-restricted-syntax
    for (const logData of logsData) {
      const emailTemplateOption = logData.selectedTemplate.replace(
        /([A-Z])/g,
        ' $1',
      )

      const selectedTemplateValue =
        emailTemplateOption.charAt(0).toUpperCase() +
        emailTemplateOption.slice(1)

      const messageBody = `${selectedTemplateValue} sent by Kotahi to ${logData.recipientName}`

      // eslint-disable-next-line no-await-in-loop
      await createTaskEmailNotificationLog({
        variables: {
          taskEmailNotificationLog: {
            taskId: task.id,
            content: messageBody,
            emailTemplateKey: emailTemplateOption,
            senderEmail: logData.senderEmail,
            recipientEmail: logData.recipientEmail,
          },
        },
      })
    }
  }

  return (
    <NotificationDetailsContainer>
      <TaskFieldsContainer>
        <TaskTitle>Recipient</TaskTitle>
        <AssigneeCell title={taskEmailNotification.recipientType}>
          <GroupedOptionsSelect
            aria-label="Recipient"
            data-testid="Recipient_select"
            dropdownState={recipientDropdownState}
            isClearable
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
          />
        </AssigneeCell>
        {isNewRecipient && (
          <UnregisteredUserCell>
            <InputField
              data-cy="new-user-email"
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
            <InputField
              data-cy="new-user-name"
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
      </TaskFieldsContainer>
      <TaskFieldsContainer>
        <TaskTitle>Email Template</TaskTitle>
        <SelectEmailTemplate
          isTaskEmailNotification
          onChangeEmailTemplate={setSelectedTemplate}
          selectedEmailTemplate={
            selectedTemplate || taskEmailNotification.emailTemplateKey
          }
          task={task}
          taskEmailNotification={taskEmailNotification}
          updateTaskNotification={updateTaskNotification}
        />
      </TaskFieldsContainer>
      <TaskFieldsContainer>
        <NotificationDeadlineContainer>
          <TaskTitle>Set Email Deadline</TaskTitle>

          <NotificationDeadlineCell>
            Send
            <MinimalNumericUpDown
              onChange={val => {
                setTaskEmailNotificationElapsedDays(val)
                handleTaskNotificationDeadline(
                  taskEmailNotificationDeadline,
                  val,
                  taskEmailNotification,
                )
              }}
              value={taskEmailNotificationElapsedDays || 0}
            />
            Days
            <MinimalSelect
              aria-label="Deadline"
              data-testid="Deadline_select"
              isClearable
              label="Deadline"
              onChange={selected => {
                setTaskEmailNotificationDeadline(selected.value)
                handleTaskNotificationDeadline(
                  selected.value,
                  taskEmailNotificationElapsedDays,
                  taskEmailNotification,
                )
              }}
              options={notificationOptions}
              placeholder="Select.."
              value={taskEmailNotificationDeadline}
            />
          </NotificationDeadlineCell>
        </NotificationDeadlineContainer>
      </TaskFieldsContainer>
      {!editAsTemplate && (
        <ActionButton
          onClick={sendTaskNotificationEmailHandler}
          primary
          status={taskNotificationStatus}
          style
        >
          Send Email
        </ActionButton>
      )}

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
