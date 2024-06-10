import React, { useMemo, useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { ownerColumns } from '../../../../../../config/journal/manuscripts'
import {
  extractSortData,
  URI_PAGENUM_PARAM,
  URI_SEARCH_PARAM,
} from '../../../../../shared/urlParamUtils'
import ManuscriptsTable from '../../../../component-manuscripts-table/src/ManuscriptsTable'
import buildColumnDefinitions from '../../../../component-manuscripts-table/src/util/buildColumnDefinitions'
import { ConfigContext } from '../../../../config/src'
import {
  Pagination,
  PaginationContainerShadowed,
  SectionContent,
  SectionHeader,
  Title,
} from '../../../../shared'

const SubmissionsTable = props => {
  const {
    currentUser,
    manuscriptsUserHasCurrentRoleIn,
    submissionForm,
    applyQueryParams,
    uriQueryParams,
  } = props

  const config = useContext(ConfigContext)
  const { urlFrag } = config
  const { t } = useTranslation()

  const fieldDefinitions = useMemo(() => {
    const fields = submissionForm?.structure?.children ?? []
    const defs = {}
    fields.forEach(field => {
      // Incomplete fields in the formbuilder may not have a name specified. Ignore these
      if (field.name) defs[field.name] = field
    })
    return defs
  }, [submissionForm])

  const currentSearchQuery = uriQueryParams.get(URI_SEARCH_PARAM)
  const sortName = extractSortData(uriQueryParams).name
  const sortDirection = extractSortData(uriQueryParams).direction

  const page = uriQueryParams.get(URI_PAGENUM_PARAM) || 1
  const limit = config?.manuscript?.paginationCount || 10
  const { totalCount } = manuscriptsUserHasCurrentRoleIn

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
    ownerColumns,
    fieldDefinitions,
    specialComponentValues,
    displayProps,
  )

  return (
    <SectionContent>
      <SectionHeader>
        <Title>
          {t(
            `dashboardPage.${
              ['lab'].includes(config.instanceName)
                ? 'Articles'
                : 'My Submissions'
            }`,
          )}
        </Title>
      </SectionHeader>

      <ManuscriptsTable
        applyQueryParams={applyQueryParams}
        columnsProps={columnsProps}
        getMainActionLink={manuscript =>
          `${urlFrag}/versions/${manuscript.parentId || manuscript.id}/${
            ['lab'].includes(config.instanceName) ? 'evaluation' : 'submit'
          }`
        }
        manuscripts={manuscriptsUserHasCurrentRoleIn.manuscripts}
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

export default SubmissionsTable
