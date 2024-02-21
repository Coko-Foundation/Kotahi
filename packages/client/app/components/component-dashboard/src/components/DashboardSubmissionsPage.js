import { gql, useMutation, useQuery } from '@apollo/client'
import React, { useEffect, useContext } from 'react'
import { ConfigContext } from '../../../config/src'
import {
  extractFilters,
  extractSortData,
  URI_PAGENUM_PARAM,
  useQueryParams,
} from '../../../../shared/urlParamUtils'
import mutations from '../graphql/mutations'
import queries from '../graphql/queries'
import SubmissionsTable from './sections/SubmissionsTable'
import { CommsErrorBanner, Spinner } from '../../../shared'
import { fragmentFields } from '../../../component-submit/src/userManuscriptFormQuery'

const updateManuscriptMutation = gql`
  mutation($id: ID!, $input: String) {
    updateManuscript(id: $id, input: $input) {
      id 
      ${fragmentFields}
    }
  }
`

const DashboardSubmissionsPage = ({ currentUser, history }) => {
  const config = useContext(ConfigContext)
  const wantedRoles = ['author']

  const applyQueryParams = useQueryParams()

  const uriQueryParams = new URLSearchParams(history.location.search)
  const page = uriQueryParams.get(URI_PAGENUM_PARAM) || 1
  const sortName = extractSortData(uriQueryParams).name
  const sortDirection = extractSortData(uriQueryParams).direction
  const filters = extractFilters(uriQueryParams)

  const limit = config?.manuscript?.paginationCount || 10

  const { loading, error, data } = useQuery(queries.dashboard, {
    variables: {
      wantedRoles,
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

  const [updateTab] = useMutation(mutations.updateTab)
  const [updateManuscript] = useMutation(updateManuscriptMutation)

  useEffect(() => {
    updateTab({
      variables: {
        tab: 'submissions',
      },
    })
  }, [])

  if (loading) return <Spinner />
  if (error) return <CommsErrorBanner error={error} />

  return config?.dashboard?.showSections?.includes('submission') ? (
    <SubmissionsTable
      applyQueryParams={applyQueryParams}
      currentUser={currentUser}
      manuscriptsUserHasCurrentRoleIn={data.manuscriptsUserHasCurrentRoleIn}
      submissionForm={data.formForPurposeAndCategory}
      updateManuscript={updateManuscript}
      uriQueryParams={uriQueryParams}
    />
  ) : null
}

export default DashboardSubmissionsPage
