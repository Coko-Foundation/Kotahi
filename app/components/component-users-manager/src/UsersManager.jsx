import React, { useState } from 'react'
import gql from 'graphql-tag'
import { useQuery } from '@apollo/react-hooks'
import { Heading } from '@pubsweet/ui'

import User from './User'
import { Container, Table, Header, Caret, Carets } from './style'
import Spinner from '../../shared/Spinner'
import Pagination from './Pagination'

const GET_USERS = gql`
  query Users(
    $sort: UsersSort
    $filter: UsersFilter
    $offset: Int
    $limit: Int
  ) {
    users(sort: $sort, filter: $filter, offset: $offset, limit: $limit) {
      totalCount
      users {
        id
        username
        admin
        email
        profilePicture
        online
        created
      }
    }
  }
`

const CaretUp = ({ active }) => (
  <Caret
    aria-hidden="true"
    className=""
    data-icon="caret-up"
    fill="currentColor"
    focusable="false"
    height="1em"
    viewBox="0 0 100 100"
    width="1em"
    active={active}
  >
    <path d="M50 17L100.229 67.25H-0.229473L50 17Z" />
  </Caret>
)


const CaretDown = ({ active }) => (
  <Caret
    active={active}
    aria-hidden="true"
    className=""
    data-icon="caret-down"
    fill="currentColor"
    focusable="false"
    height="1em"
    viewBox="0 0 100 100"
    width="1em"
  >
    <path d="M50 84L-0.229473 33.75L100.229 33.75L50 84Z" />
  </Caret>
)

const UsersManager = () => {
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
  if (error) return `Error! ${error.message}`

  const { users, totalCount } = data.users

  return (
    <Container>
      <Heading level={1}>Users</Heading>
      <Table>
        <Header>
          <tr>
            <SortHeader thisSortName="username">Name</SortHeader>
            <SortHeader thisSortName="created">Created</SortHeader>
            <SortHeader thisSortName="admin">Admin</SortHeader>
            <th />
          </tr>
        </Header>
        <tbody>
          {users.map((user, key) => (
            <User key={user.id} number={key + 1} user={user} />
          ))}
        </tbody>
      </Table>
      <Pagination
        limit={limit}
        page={page}
        setPage={setPage}
        totalCount={totalCount}
      />
    </Container>
  )
}

export default UsersManager
