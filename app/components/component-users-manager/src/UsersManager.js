import React, { useState } from 'react'
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
        online
        created
      }
    }
  }
`

const UsersManager = ({ currentUser }) => {
  const SortHeader = ({ thisSortName, children }) => {
    const changeSort = () => {
      if (sortName !== thisSortName) {
        setSortName(thisSortName)
        setSortDirection('ASC')
      } else if (sortDirection === 'ASC') {
        setSortDirection('DESC')
      } else if (sortDirection === 'DESC') {
        setSortName()
        setSortDirection()
      }
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

  const [sortName, setSortName] = useState('created')
  const [sortDirection, setSortDirection] = useState('DESC')
  const [page, setPage] = useState(1)
  const limit = 10
  const sort = sortName && sortDirection && `${sortName}_${sortDirection}`

  const { loading, error, data } = useQuery(GET_USERS, {
    variables: {
      sort,
      offset: (page - 1) * limit,
      limit,
    },
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
              <SortHeader thisSortName="username">Name</SortHeader>
              <SortHeader thisSortName="created">Created</SortHeader>
              <SortHeader thisSortName="admin">Admin</SortHeader>
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
          setPage={setPage}
          totalCount={totalCount}
        />
      </Content>
    </Container>
  )
}

export default UsersManager
