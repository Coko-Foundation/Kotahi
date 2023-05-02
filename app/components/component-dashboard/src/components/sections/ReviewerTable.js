import React, { useMemo, useContext } from 'react'
import ManuscriptsTable from '../../../../component-manuscripts-table/src/ManuscriptsTable'
import buildColumnDefinitions from '../../../../component-manuscripts-table/src/util/buildColumnDefinitions'
import {
  CommsErrorBanner,
  Pagination,
  PaginationContainerShadowed,
  SectionContent,
  SectionHeader,
  Spinner,
  Title,
} from '../../../../shared'
import { reviewerColumns } from '../../../../../../config/journal/manuscripts'
import {
  extractSortData,
  URI_PAGENUM_PARAM,
  URI_SEARCH_PARAM,
} from '../../../../../shared/urlParamUtils'
import { ConfigContext } from '../../../../config/src'

const ReviewerTable = ({
  urlFrag,
  query: { data, loading, error },
  reviewerRespond,
  updateReviewerStatus,
  uriQueryParams,
  applyQueryParams,
}) => {
  const config = useContext(ConfigContext)

  const fieldDefinitions = useMemo(() => {
    const fields = data?.formForPurposeAndCategory?.structure?.children ?? []
    const defs = {}
    fields.forEach(field => {
      // Incomplete fields in the formbuilder may not have a name specified. Ignore these
      if (field.name) defs[field.name] = field
    })
    return defs
  }, [data])

  if (loading) return <Spinner />
  if (error) return <CommsErrorBanner error={error} />

  const currentUser = data && data.currentUser

  const currentSearchQuery = uriQueryParams.get(URI_SEARCH_PARAM)
  const sortName = extractSortData(uriQueryParams).name
  const sortDirection = extractSortData(uriQueryParams).direction

  const page = uriQueryParams.get(URI_PAGENUM_PARAM) || 1
  const limit = config?.manuscript?.paginationCount || 10
  const { totalCount } = data.manuscriptsUserHasCurrentRoleIn

  const getMainActionLink = manuscript => {
    const reviewerStatus = manuscript.teams
      ?.find(team => team.role === 'reviewer')
      ?.members?.find(member => member.user.id === currentUser.id)?.status

    return reviewerStatus === 'invited' || reviewerStatus === 'rejected'
      ? `${urlFrag}/versions/${manuscript.id}/reviewPreview`
      : `${urlFrag}/versions/${manuscript.parentId || manuscript.id}/review`
  }

  const specialComponentValues = {
    urlFrag,
    currentUser,
    reviewerRespond,
    updateReviewerStatus,
    getMainActionLink,
  }

  const displayProps = {
    uriQueryParams,
    columnToSortOn: sortName,
    sortDirection,
    currentSearchQuery,
  }

  const columnsProps = buildColumnDefinitions(
    config,
    reviewerColumns,
    fieldDefinitions,
    specialComponentValues,
    displayProps,
  )

  return (
    <SectionContent>
      <SectionHeader>
        <Title>To Review</Title>
      </SectionHeader>
      <ManuscriptsTable
        applyQueryParams={applyQueryParams}
        columnsProps={columnsProps}
        getMainActionLink={getMainActionLink}
        manuscripts={data?.manuscriptsUserHasCurrentRoleIn.manuscripts}
        sortDirection={sortDirection}
        sortName={sortName}
      />
      <Pagination
        limit={limit}
        page={page}
        PaginationContainer={PaginationContainerShadowed}
        setPage={newPage => applyQueryParams({ [URI_PAGENUM_PARAM]: newPage })}
        totalCount={totalCount}
      />
    </SectionContent>
  )
}

export default ReviewerTable
