/* eslint-disable no-shadow */

import React, { useState, useEffect, useContext } from 'react'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import {
  useQuery,
  useMutation,
  useSubscription,
  useApolloClient,
} from '@apollo/client'
import fnv from 'fnv-plus'
import { ConfigContext } from '../../config/src'
import {
  GET_MANUSCRIPTS_AND_FORM,
  DELETE_MANUSCRIPT,
  IMPORT_MANUSCRIPTS,
  IMPORTED_MANUSCRIPTS_SUBSCRIPTION,
  GET_SYSTEM_WIDE_DISCUSSION_CHANNEL,
  ARCHIVE_MANUSCRIPT,
  ARCHIVE_MANUSCRIPTS,
} from '../../../queries'
import { updateMutation } from '../../component-submit/src/components/SubmitPage'
import { publishManuscriptMutation } from '../../component-review/src/components/queries'
import getUriQueryParams from './getUriQueryParams'
import Manuscripts from './Manuscripts'
import { validateDoi, validateSuffix } from '../../../shared/commsUtils'

const ManuscriptsPage = ({ history }) => {
  const config = useContext(ConfigContext)
  const urlFrag = config.journal.metadata.toplevel_urlfragment
  const chatRoomId = fnv.hash(config.baseUrl).hex()

  /** Returns an array of column names, e.g.
   *  ['shortId', 'created', 'meta.title', 'submission.topic', 'status'] */
  const configuredColumnNames = (config?.manuscript?.tableColumns || '')
    .split(',')
    .map(columnName => columnName.trim())

  const [sortName, setSortName] = useState('created')
  const [sortDirection, setSortDirection] = useState('DESC')
  const [page, setPage] = useState(1)
  const [isImporting, setIsImporting] = useState(false)

  const uriQueryParams = getUriQueryParams(window.location)
  const limit = config?.manuscript?.paginationCount || 10

  const queryObject = useQuery(GET_MANUSCRIPTS_AND_FORM, {
    variables: {
      sort: sortName
        ? { field: sortName, isAscending: sortDirection === 'ASC' }
        : null,
      offset: (page - 1) * limit,
      limit,
      filters: uriQueryParams,
      timezoneOffsetMinutes: new Date().getTimezoneOffset(),
    },
    fetchPolicy: 'network-only',
  })

  // GET_SYSTEM_WIDE_DISCUSSION_ID
  const systemWideDiscussionChannel = useQuery(
    GET_SYSTEM_WIDE_DISCUSSION_CHANNEL,
  )

  useEffect(() => {
    queryObject.refetch()
    setPage(1)
  }, [history.location.search])

  useSubscription(IMPORTED_MANUSCRIPTS_SUBSCRIPTION, {
    onSubscriptionData: data => {
      const {
        subscriptionData: {
          data: { manuscriptsImportStatus },
        },
      } = data

      queryObject.refetch()
      setIsImporting(false)
      setPage(1)

      toast.success(
        manuscriptsImportStatus && 'Manuscripts successfully imported',
        { hideProgressBar: true },
      )
    },
  })

  const [importManuscripts] = useMutation(IMPORT_MANUSCRIPTS)

  const importManuscriptsAndRefetch = () => {
    setIsImporting(true)
    importManuscripts()
  }

  const [archiveManuscriptMutation] = useMutation(ARCHIVE_MANUSCRIPT, {
    update(cache, { data: { id } }) {
      const cacheId = cache.identify({
        __typename: 'Manuscript',
        id,
      })

      cache.evict({ cacheId })
    },
  })

  const archiveManuscriptMutations = id => {
    archiveManuscriptMutation({ variables: { id } })
  }

  const [archiveManuscripts] = useMutation(ARCHIVE_MANUSCRIPTS, {
    update(cache, { data: { ids } }) {
      const cacheIds = cache.identify({
        __typename: 'Manuscript',
        id: ids,
      })

      cache.evict({ cacheIds })
    },
  })

  const [deleteManuscriptMutation] = useMutation(DELETE_MANUSCRIPT, {
    update(cache, { data: { id } }) {
      const cacheId = cache.identify({
        __typename: 'Manuscript',
        id,
      })

      cache.evict({ cacheId })
    },
  })

  const deleteManuscriptMutations = id => {
    deleteManuscriptMutation({ variables: { id } })
  }

  const setReadyToEvaluateLabels = id => {
    update({
      variables: {
        id,
        input: JSON.stringify({
          submission: {
            labels: 'readyToEvaluate',
          },
        }),
      },
    })
  }

  const confirmBulkArchive = selectedNewManuscript => {
    archiveManuscripts({
      variables: { ids: selectedNewManuscript },
    })
  }

  const [update] = useMutation(updateMutation)
  const [publishManuscript] = useMutation(publishManuscriptMutation)
  const client = useApolloClient()

  const publishManuscripts = manuscriptId => {
    publishManuscript({
      variables: { id: manuscriptId },
    })
  }

  const shouldAllowBulkImport = config?.manuscript?.manualImport

  return (
    <Manuscripts
      archiveManuscriptMutations={archiveManuscriptMutations}
      chatRoomId={chatRoomId}
      configuredColumnNames={configuredColumnNames}
      confirmBulkArchive={confirmBulkArchive}
      deleteManuscriptMutations={deleteManuscriptMutations}
      history={history}
      importManuscripts={importManuscriptsAndRefetch}
      isImporting={isImporting}
      page={page}
      publishManuscripts={publishManuscripts}
      queryObject={queryObject}
      setPage={setPage}
      setReadyToEvaluateLabels={setReadyToEvaluateLabels}
      setSortDirection={setSortDirection}
      setSortName={setSortName}
      shouldAllowBulkImport={shouldAllowBulkImport}
      sortDirection={sortDirection}
      sortName={sortName}
      systemWideDiscussionChannel={systemWideDiscussionChannel}
      urlFrag={urlFrag}
      validateDoi={validateDoi(client)}
      validateSuffix={validateSuffix(client)}
    />
  )
}

export default ManuscriptsPage
