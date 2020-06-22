import React, { useState } from 'react'
import gql from 'graphql-tag'
import { useQuery } from '@apollo/react-hooks'
import { Heading } from '@pubsweet/ui'

import Manuscript from './Manuscript'
import { Container, Table, Header, Caret, Carets } from './style'
import Spinner from '../../shared/Spinner'
import Pagination from '../../shared/Pagination'

const GET_MANUSCRIPTS = gql`
  query Manuscripts(
    $sort: String
    $filter: ManuscriptsFilter
    $offset: Int
    $limit: Int
  ) {
    paginatedManuscripts(sort: $sort, filter: $filter, offset: $offset, limit: $limit) {
      totalCount
      manuscripts {
        id
        meta {
          title
        }
        created
        updated
        status
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

const Manuscripts = () => {
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

  const { loading, error, data } = useQuery(GET_MANUSCRIPTS, {
    variables: {
      sort,
      offset: (page - 1) * limit,
      limit,
    },
  })

  if (loading) return <Spinner />
  if (error) return `Error! ${error.message}`

  const { manuscripts, totalCount } = data.paginatedManuscripts

  return (
    <Container>
      <Heading level={1}>Manuscripts</Heading>
      <Table>
        <Header>
          <tr>
            <SortHeader thisSortName="title">Title</SortHeader>
            <SortHeader thisSortName="created">Created</SortHeader>
            <SortHeader thisSortName="status">Status</SortHeader>
            <th />
          </tr>
        </Header>
        <tbody>
          {manuscripts.map((manuscript, key) => (
            <Manuscript key={manuscript.id} number={key + 1} manuscript={manuscript} />
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

export default Manuscripts