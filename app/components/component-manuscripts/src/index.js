/* eslint-disable no-shadow */

import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import {
  useQuery,
  useMutation,
  useSubscription,
  useApolloClient,
} from '@apollo/client'
import config from 'config'
import fnv from 'fnv-plus'
import {
  GET_MANUSCRIPTS_AND_FORM,
  DELETE_MANUSCRIPT,
  DELETE_MANUSCRIPTS,
  IMPORT_MANUSCRIPTS,
  IMPORTED_MANUSCRIPTS_SUBSCRIPTION,
} from '../../../queries'
import configuredColumnNames from './configuredColumnNames'
import { updateMutation } from '../../component-submit/src/components/SubmitPage'
import { publishManuscriptMutation } from '../../component-review/src/components/queries'
import getUriQueryParams from './getUriQueryParams'
import Manuscripts from './Manuscripts'

const urlFrag = config.journal.metadata.toplevel_urlfragment
const chatRoomId = fnv.hash(config['pubsweet-client'].baseUrl).hex()

const ManuscriptTable = ({ history }) => {
  const [sortName, setSortName] = useState('created')
  const [sortDirection, setSortDirection] = useState('DESC')
  const [page, setPage] = useState(1)

  const uriQueryParams = getUriQueryParams(window.location)
  const limit = process.env.INSTANCE_NAME === 'ncrc' ? 100 : 10

  const queryObject = useQuery(GET_MANUSCRIPTS_AND_FORM, {
    variables: {
      sort: sortName
        ? { field: sortName, isAscending: sortDirection === 'ASC' }
        : null,
      offset: (page - 1) * limit,
      limit,
      filters: uriQueryParams,
    },
    fetchPolicy: 'network-only',
  })

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

      toast.success(
        manuscriptsImportStatus && 'Manuscripts successfully imported',
      )
    },
  })

  const [importManuscripts] = useMutation(IMPORT_MANUSCRIPTS)

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

  const [deleteManuscripts] = useMutation(DELETE_MANUSCRIPTS, {
    // eslint-disable-next-line no-shadow
    update(cache, { data: { ids } }) {
      const cacheIds = cache.identify({
        __typename: 'Manuscript',
        id: ids,
      })

      cache.evict({ cacheIds })
    },
  })

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

  const confrimBulkDelete = selectedNewManuscript => {
    deleteManuscripts({
      variables: { ids: selectedNewManuscript }, // TODO These may not be parent IDs. Will this cause issues?
    })
  }

  const [update] = useMutation(updateMutation)
  const [publishManuscript] = useMutation(publishManuscriptMutation)

  const publishManuscripts = manuscriptId => {
    publishManuscript({
      variables: { id: manuscriptId },
    })
  }

  const client = useApolloClient()

  return (
    <Manuscripts
      chatRoomId={chatRoomId}
      client={client}
      configuredColumnNames={configuredColumnNames}
      confrimBulkDelete={confrimBulkDelete}
      deleteManuscriptMutations={deleteManuscriptMutations}
      history={history}
      importManuscripts={importManuscripts}
      page={page}
      publishManuscripts={publishManuscripts}
      queryObject={queryObject}
      setPage={setPage}
      setReadyToEvaluateLabels={setReadyToEvaluateLabels}
      setSortDirection={setSortDirection}
      setSortName={setSortName}
      sortDirection={sortDirection}
      sortName={sortName}
      urlFrag={urlFrag}
    />
  )
}

export default ManuscriptTable
