import React, { useContext } from 'react'
import { useQuery } from '@apollo/client'
import FlaxPageRow from './FlaxPageRow'

import { Container, Table, Header, Heading, Content, Spinner } from './style'
import { CommsErrorBanner } from '../../shared'
// import { extractSortData, useQueryParams } from '../../../shared/urlParamUtils'

import { ConfigContext } from '../../config/src'

import { getFlaxPages } from './queries'

const FlaxManager = ({ history }) => {
  const SortHeader = ({ children }) => {
    // const changeSort = () => {
    //   let newSortDirection

    //   if (sortName !== thisSortName) {
    //     newSortDirection = defaultSortDirection || 'ASC'
    //   } else if (sortDirection === 'ASC') {
    //     newSortDirection = 'DESC'
    //   } else if (sortDirection === 'DESC') {
    //     newSortDirection = 'ASC'
    //   }

    //   applyQueryParams({
    //     [URI_SORT_PARAM]: `${thisSortName}_${newSortDirection}`,
    //     [URI_PAGENUM_PARAM]: 1,
    //   })
    // }

    // const UpDown = () => {
    //   if (thisSortName === sortName) {
    //     return (
    //       <Carets>
    //         <CaretUp active={sortDirection === 'ASC'} />
    //         <CaretDown active={sortDirection === 'DESC'} />
    //       </Carets>
    //     )
    //     // return sortDirection
    //   }

    //   return null
    // }

    return <th>{children}</th>
  }

  // const applyQueryParams = useQueryParams()

  // const params = new URLSearchParams(history.location.search)
  // const sortName = extractSortData(params).name || 'created'
  // const sortDirection = extractSortData(params).direction || 'DESC'

  const config = useContext(ConfigContext)
  const urlFrag = config.journal.metadata.toplevel_urlfragment

  const { loading, error, data } = useQuery(getFlaxPages, {
    fetchPolicy: 'cache-and-network',
  })

  const showManagePage = currentFlaxPage => {
    const link = `${urlFrag}/admin/flax/flax-edit/${currentFlaxPage.id}`
    history.push(link)
  }

  if (loading) return <Spinner />
  if (error) return <CommsErrorBanner error={error} />

  const { flaxPages } = data

  return (
    <Container>
      <Heading>Flax Pages</Heading>
      <Content>
        <Table>
          <Header>
            <tr>
              <SortHeader defaultSortDirection="ASC" thisSortName="username">
                Title
              </SortHeader>
              <SortHeader defaultSortDirection="DESC" thisSortName="created">
                Created
              </SortHeader>
              {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
              <th />
            </tr>
          </Header>
          <tbody>
            {flaxPages.map(flaxPage => (
              <FlaxPageRow
                flaxPage={flaxPage}
                key={flaxPage.id}
                onManageClick={currentFlaxPage =>
                  showManagePage(currentFlaxPage)
                }
              />
            ))}
          </tbody>
        </Table>
      </Content>
    </Container>
  )
}

export default FlaxManager
