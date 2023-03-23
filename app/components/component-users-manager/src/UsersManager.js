import React from 'react'
import gql from 'graphql-tag'
import { useQuery } from '@apollo/client'
// import { Heading } from '@pubsweet/ui'

import User from './User'
import {
  Container,
  Table,
  Header,
  Heading,
  Content,
  Spinner,
  Pagination,
  CaretUp,
  CaretDown,
  Carets,
} from './style'
import { CommsErrorBanner, PaginationContainer } from '../../shared'
import {
  extractSortData,
  URI_PAGENUM_PARAM,
  URI_SORT_PARAM,
  useQueryParams,
} from '../../../shared/urlParamUtils'

const GET_USERS = gql`
  query Users(
    $sort: UsersSort
    $filter: UsersFilter
    $offset: Int
    $limit: Int
  ) {
    paginatedUsers(
      sort: $sort
      filter: $filter
      offset: $offset
      limit: $limit
    ) {
      totalCount
      users {
        id
        username
        admin
        email
        profilePicture
        defaultIdentity {
          id
          identifier
        }
        created
        isOnline
        lastOnline
      }
    }
  }
`

const UsersManager = ({ history, currentUser }) => {
  const SortHeader = ({ thisSortName, defaultSortDirection, children }) => {
    const changeSort = () => {
      let newSortDirection

      if (sortName !== thisSortName) {
        newSortDirection = defaultSortDirection || 'ASC'
      } else if (sortDirection === 'ASC') {
        newSortDirection = 'DESC'
      } else if (sortDirection === 'DESC') {
        newSortDirection = 'ASC'
      }

      applyQueryParams({
        [URI_SORT_PARAM]: `${thisSortName}_${newSortDirection}`,
        [URI_PAGENUM_PARAM]: 1,
      })
    }

    const UpDown = () => {
      if (thisSortName === sortName) {
        return (
          <Carets>
            <CaretUp active={sortDirection === 'ASC'} />
            <CaretDown active={sortDirection === 'DESC'} />
          </Carets>
        )
        // return sortDirection
      }

      return null
    }

    return (
      <th onClick={changeSort}>
        {children} {UpDown()}
      </th>
    )
  }

  const applyQueryParams = useQueryParams()

  const params = new URLSearchParams(history.location.search)
  const page = params.get(URI_PAGENUM_PARAM) || 1
  const sortName = extractSortData(params).name || 'created'
  const sortDirection = extractSortData(params).direction || 'DESC'
  const limit = 10
  const sort = sortName && sortDirection && `${sortName}_${sortDirection}`

  const { loading, error, data } = useQuery(GET_USERS, {
    variables: {
      sort,
      offset: (page - 1) * limit,
      limit,
    },
    fetchPolicy: 'cache-and-network',
  })

  if (loading) return <Spinner />
  if (error) return <CommsErrorBanner error={error} />

  const { users, totalCount } = data.paginatedUsers

  return (
    <Container>
      <Heading>Users</Heading>
      <Content>
        <Table>
          <Header>
            <tr>
              <SortHeader defaultSortDirection="ASC" thisSortName="username">
                Name
              </SortHeader>
              <SortHeader defaultSortDirection="DESC" thisSortName="created">
                Created
              </SortHeader>
              <SortHeader defaultSortDirection="DESC" thisSortName="lastOnline">
                Last Online
              </SortHeader>
              <SortHeader defaultSortDirection="ASC" thisSortName="admin">
                Admin
              </SortHeader>
              {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
              <th />
            </tr>
          </Header>
          <tbody>
            {users.map(user => (
              <User currentUser={currentUser} key={user.id} user={user} />
            ))}
          </tbody>
        </Table>

        <Pagination
          limit={limit}
          page={page}
          PaginationContainer={PaginationContainer}
          setPage={newPage =>
            applyQueryParams({ [URI_PAGENUM_PARAM]: newPage })
          }
          totalCount={totalCount}
        />
      </Content>
    </Container>
  )
}

export default UsersManager
