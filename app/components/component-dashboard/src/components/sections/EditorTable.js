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
import { editorColumns } from '../../../../../../config/journal/manuscripts'
import {
  extractSortData,
  URI_PAGENUM_PARAM,
  URI_SEARCH_PARAM,
} from '../../../../../shared/urlParamUtils'
import { ConfigContext } from '../../../../config/src'

const EditorTable = ({
  urlFrag,
  query: { data, loading, error },
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

  const specialComponentValues = {
    urlFrag,
    currentUser,
  }

  const displayProps = {
    uriQueryParams,
    columnToSortOn: sortName,
    sortDirection,
    currentSearchQuery,
  }

  const columnsProps = buildColumnDefinitions(
    config,
    editorColumns,
    fieldDefinitions,
    specialComponentValues,
    displayProps,
  )

  return (
    <>
      <SectionContent>
        <SectionHeader>
          <Title>Manuscripts I&apos;m editor of</Title>
        </SectionHeader>
        <ManuscriptsTable
          applyQueryParams={applyQueryParams}
          columnsProps={columnsProps}
          manuscripts={data.manuscriptsUserHasCurrentRoleIn.manuscripts}
          sortDirection={sortDirection}
          sortName={sortName}
        />
        <Pagination
          limit={limit}
          page={page}
          PaginationContainer={PaginationContainerShadowed}
          setPage={newPage =>
            applyQueryParams({ [URI_PAGENUM_PARAM]: newPage })
          }
          totalCount={totalCount}
        />
      </SectionContent>
    </>
  )
}

export default EditorTable
