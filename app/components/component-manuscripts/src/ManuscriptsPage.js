/* eslint-disable no-shadow */

import React, { useState, useContext } from 'react'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useTranslation } from 'react-i18next'
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
import Manuscripts from './Manuscripts'
import {
  extractFilters,
  extractSortData,
  URI_PAGENUM_PARAM,
  useQueryParams,
} from '../../../shared/urlParamUtils'
import { validateDoi, validateSuffix } from '../../../shared/commsUtils'
import useChat from '../../../hooks/useChat'
import { updateManuscriptMutation } from '../../component-review/src/components/DecisionPage'

const ManuscriptsPage = ({ currentUser, history }) => {
  const { t } = useTranslation()
  const [doUpdateManuscript] = useMutation(updateManuscriptMutation)
  const config = useContext(ConfigContext)
  const { urlFrag } = config
  const chatRoomId = fnv.hash(config.baseUrl).hex()

  /** Returns an array of column names, e.g.
   *  ['shortId', 'created', 'meta.title', 'submission.topic', 'status'] */
  const configuredColumnNames = (config?.manuscript?.tableColumns || '')
    .split(',')
    .map(columnName => columnName.trim())

  const [isImporting, setIsImporting] = useState(false)
  const applyQueryParams = useQueryParams()

  const uriQueryParams = new URLSearchParams(history.location.search)
  const page = uriQueryParams.get(URI_PAGENUM_PARAM) || 1
  const sortName = extractSortData(uriQueryParams).name
  const sortDirection = extractSortData(uriQueryParams).direction
  const filters = extractFilters(uriQueryParams)
  const limit = config?.manuscript?.paginationCount || 10

  const queryObject = useQuery(GET_MANUSCRIPTS_AND_FORM, {
    variables: {
      sort: sortName
        ? { field: sortName, isAscending: sortDirection === 'ASC' }
        : null,
      offset: (page - 1) * limit,
      limit,
      filters,
      timezoneOffsetMinutes: new Date().getTimezoneOffset(),
      groupId: config.groupId,
    },
    fetchPolicy: 'network-only',
  })

  // GET_SYSTEM_WIDE_DISCUSSION_ID
  const systemWideDiscussionChannel = useQuery(
    GET_SYSTEM_WIDE_DISCUSSION_CHANNEL,
    {
      variables: { groupId: config.groupId },
    },
  )

  useSubscription(IMPORTED_MANUSCRIPTS_SUBSCRIPTION, {
    onSubscriptionData: data => {
      const {
        subscriptionData: {
          data: { manuscriptsImportStatus },
        },
      } = data

      setIsImporting(false)
      applyQueryParams({ [URI_PAGENUM_PARAM]: 1 })

      toast.success(
        manuscriptsImportStatus && 'Manuscripts successfully imported',
        { hideProgressBar: true },
      )
    },
  })

  const [importManuscripts] = useMutation(IMPORT_MANUSCRIPTS)

  const importManuscriptsAndRefetch = () => {
    setIsImporting(true)
    importManuscripts({
      variables: {
        groupId: config.groupId,
      },
    })
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
  const [doPublishManuscript] = useMutation(publishManuscriptMutation)
  const client = useApolloClient()

  const publishManuscript = async manuscriptId => {
    return doPublishManuscript({
      variables: { id: manuscriptId },
    })
  }

  const shouldAllowBulkImport = config?.manuscript?.manualImport

  const groupManagerDiscussionChannel =
    systemWideDiscussionChannel?.data?.systemWideDiscussionChannel

  const channels = [
    {
      id: groupManagerDiscussionChannel?.id,
      name: t('chat.Group Manager discussion'),
      type: groupManagerDiscussionChannel?.type,
    },
  ]

  const chatProps = useChat(channels)

  return (
    <Manuscripts
      applyQueryParams={applyQueryParams}
      archiveManuscriptMutations={archiveManuscriptMutations}
      channels={channels}
      chatProps={chatProps}
      chatRoomId={chatRoomId}
      configuredColumnNames={configuredColumnNames}
      confirmBulkArchive={confirmBulkArchive}
      currentUser={currentUser}
      deleteManuscriptMutations={deleteManuscriptMutations}
      doUpdateManuscript={doUpdateManuscript}
      groupManagerDiscussionChannel={groupManagerDiscussionChannel}
      history={history}
      importManuscripts={importManuscriptsAndRefetch}
      isImporting={isImporting}
      page={page}
      publishManuscript={publishManuscript}
      queryObject={queryObject}
      setReadyToEvaluateLabels={setReadyToEvaluateLabels}
      shouldAllowBulkImport={shouldAllowBulkImport}
      sortDirection={sortDirection}
      sortName={sortName}
      uriQueryParams={uriQueryParams}
      urlFrag={urlFrag}
      validateDoi={validateDoi(client)}
      validateSuffix={validateSuffix(client, config.groupId)}
    />
  )
}

export default ManuscriptsPage
