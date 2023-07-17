import gql from 'graphql-tag'

export const GET_USER = gql`
  query user($id: ID, $username: String) {
    user(id: $id, username: $username) {
      id
      username
      profilePicture
      isOnline
      email
    }
  }
`

export const CREATE_MESSAGE = gql`
  mutation createMessage($content: String, $channelId: String) {
    createMessage(content: $content, channelId: $channelId) {
      content
      user {
        username
      }
    }
  }
`

export const GET_BLACKLIST_INFORMATION = gql`
  query getBlacklistInformation($email: String) {
    getBlacklistInformation(email: $email) {
      id
    }
  }
`

export const GET_EMAIL_INVITED_REVIEWERS = gql`
  query getEmailInvitedReviewers($manuscriptId: ID!) {
    getEmailInvitedReviewers(manuscriptId: $manuscriptId) {
      id
      invitedPersonName
      isShared
      status
    }
  }
`

export const UPDATE_SHARED_STATUS_FOR_INVITED_REVIEWER_MUTATION = gql`
  mutation($invitationId: ID!, $isShared: Boolean!) {
    updateSharedStatusForInvitedReviewer(
      invitationId: $invitationId
      isShared: $isShared
    ) {
      id
      isShared
    }
  }
`
export const ADD_EMAIL_TO_BLACKLIST = gql`
  mutation($email: String!) {
    addEmailToBlacklist(email: $email) {
      email
    }
  }
`

export const GET_MESSAGE_BY_ID = gql`
  query messageById($messageId: ID) {
    message(messageId: $messageId) {
      id
      content
      user {
        username
        profilePicture
      }
    }
  }
`

export const SEARCH_USERS = gql`
  query searchUsers($teamId: ID, $query: String) {
    searchUsers(teamId: $teamId, query: $query) {
      id
      username
      profilePicture
      isOnline
    }
  }
`

export const ARCHIVE_MANUSCRIPT = gql`
  mutation($id: ID!) {
    archiveManuscript(id: $id)
  }
`

export const ARCHIVE_MANUSCRIPTS = gql`
  mutation($ids: [ID!]!) {
    archiveManuscripts(ids: $ids)
  }
`

export const DELETE_MANUSCRIPT = gql`
  mutation($id: ID!) {
    deleteManuscript(id: $id)
  }
`

export const DELETE_MANUSCRIPTS = gql`
  mutation($ids: [ID]!) {
    deleteManuscripts(ids: $ids)
  }
`

export const GET_MANUSCRIPTS_AND_FORM = gql`
  query Manuscripts(
    $sort: ManuscriptsSort
    $filters: [ManuscriptsFilter!]!
    $offset: Int
    $limit: Int
    $timezoneOffsetMinutes: Int
  ) {
    paginatedManuscripts(
      sort: $sort
      filters: $filters
      offset: $offset
      limit: $limit
      timezoneOffsetMinutes: $timezoneOffsetMinutes
    ) {
      totalCount
      manuscripts {
        id
        shortId
        meta {
          manuscriptId
          abstract
          title
        }
        submission
        created
        updated
        status
        published
        teams {
          id
          role
          members {
            id
            user {
              id
              username
            }
          }
        }
        importSourceServer
        manuscriptVersions {
          id
          shortId
          meta {
            manuscriptId
            abstract
            title
          }
          submission
          created
          updated
          status
          published
          teams {
            id
            role
            members {
              id
              user {
                defaultIdentity {
                  identifier
                }
                id
                username
              }
            }
          }
          submitter {
            username
            isOnline
            defaultIdentity {
              id
              identifier
              name
            }
            id
            profilePicture
          }
          importSourceServer
        }
        submitter {
          username
          isOnline
          defaultIdentity {
            id
            identifier
            name
          }
          id
          profilePicture
        }
        searchSnippet
      }
    }

    formForPurposeAndCategory(purpose: "submit", category: "submission") {
      structure {
        children {
          id
          component
          name
          title
          shortDescription
          validate {
            id
            label
            value
            labelColor
          }
          validateValue {
            minChars
            maxChars
            minSize
          }
          doiValidation
          doiUniqueSuffixValidation
          options {
            id
            label
            labelColor
            value
          }
        }
      }
    }
  }
`

export const IMPORT_MANUSCRIPTS = gql`
  mutation {
    importManuscripts
  }
`

export const IMPORTED_MANUSCRIPTS_SUBSCRIPTION = gql`
  subscription manuscriptsImportStatus {
    manuscriptsImportStatus
  }
`

export const GET_SYSTEM_WIDE_DISCUSSION_CHANNEL = gql`
  query {
    systemWideDiscussionChannel {
      id
      type
    }
  }
`

const taskFields = `
id
created
updated
manuscriptId
title
assigneeUserId
assignee {
  id
  username
  email
  profilePicture
}
defaultDurationDays
dueDate
reminderPeriodDays
sequenceIndex
status
emailNotifications {
  id
  taskId
  recipientUserId
  recipientType
  notificationElapsedDays
  emailTemplateId
  recipientName
  recipientEmail
  recipientUser {
    id
    username
    email
  }
  sentAt
}
notificationLogs {
  id
  taskId
  senderEmail
  recipientEmail
  emailTemplateId
  content
  updated
  created
}
assigneeType
assigneeName
assigneeEmail

`

export const UPDATE_TASKS = gql`
  mutation($manuscriptId: ID, $tasks: [TaskInput!]!) {
    updateTasks(manuscriptId: $manuscriptId, tasks: $tasks) {
      ${taskFields}
    }
  }
`

export const UPDATE_TASK = gql`
  mutation($task: TaskInput!) {
    updateTask(task: $task) {
      ${taskFields}
    }
  }
`

export const UPDATE_TASK_NOTIFICATION = gql`
  mutation ($taskNotification: TaskEmailNotificationInput!) {
    updateTaskNotification(taskNotification: $taskNotification) {
      ${taskFields}
    }
  }
`
export const DELETE_TASK_NOTIFICATION = gql`
  mutation($id: ID!) {
    deleteTaskNotification(id: $id)
    {
      ${taskFields}
    }
  }
`
export const UPDATE_TASK_STATUS = gql`
  mutation($task: UpdateTaskStatusInput!) {
    updateTaskStatus(task: $task) {
      ${taskFields}
    }
  }
`

export const CREATE_TASK_EMAIL_NOTIFICATION_LOGS = gql`
mutation($taskEmailNotificationLog: TaskEmailNotificationLogInput!) {
  createTaskEmailNotificationLog(taskEmailNotificationLog: $taskEmailNotificationLog) {
    ${taskFields}
  }
}
`

export const GET_CONFIG = gql`
  query config {
    oldConfig
    config {
      id
      formData
      active
    }
  }
`

export const UPDATE_CONFIG = gql`
  mutation($id: ID!, $input: ConfigInput) {
    updateConfig(id: $id, input: $input) {
      id
      formData
      active
    }
  }
`

export const GET_EMAIL_TEMPLATES = gql`
  query {
    emailTemplates {
      id
      created
      updated
      emailTemplateType
      emailContent {
        cc
        subject
        body
        description
      }
    }
  }
`
