import React from 'react'
import { Subscription } from '@apollo/client/react/components'
import { gql } from '@apollo/client'

const FILES_UPLOADED_SUBSCRIPTION = gql`
  subscription FilesUploaded {
    filesUploaded
  }
`

const FILES_DELETED_SUBSCRIPTION = gql`
  subscription FilesDeleted {
    filesDeleted
  }
`

const FILE_UPDATED_SUBSCRIPTION = gql`
  subscription FileUpdated {
    fileUpdated {
      id
    }
  }
`

const filesUploadedSubscription = props => {
  const { render, getEntityFilesQuery } = props

  const triggerRefetch = () => {
    getEntityFilesQuery.refetch()
  }

  return (
    <Subscription
      onSubscriptionData={triggerRefetch}
      subscription={FILES_UPLOADED_SUBSCRIPTION}
    >
      {render}
    </Subscription>
  )
}

const filesDeletedSubscription = props => {
  const { render, getEntityFilesQuery } = props

  const triggerRefetch = () => {
    getEntityFilesQuery.refetch()
  }

  return (
    <Subscription
      onSubscriptionData={triggerRefetch}
      subscription={FILES_DELETED_SUBSCRIPTION}
    >
      {render}
    </Subscription>
  )
}

const fileUpdatedSubscription = props => {
  const { render, getEntityFilesQuery } = props

  const triggerRefetch = () => {
    getEntityFilesQuery.refetch()
  }

  return (
    <Subscription
      onSubscriptionData={triggerRefetch}
      subscription={FILE_UPDATED_SUBSCRIPTION}
    >
      {render}
    </Subscription>
  )
}

export {
  filesUploadedSubscription,
  filesDeletedSubscription,
  fileUpdatedSubscription,
}
