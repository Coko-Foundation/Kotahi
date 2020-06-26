import React, { useState } from 'react'
import gql from 'graphql-tag'
import { useQuery } from '@apollo/react-hooks'


import Manuscript from './Manuscript'
import { Container, Table, Header, Content, PageHeading } from './style'
import { Carets, CaretUp, CaretDown } from '../../shared'
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
        submitter {
          username
          profilePicture
        }
      }
    }
  }
`

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
      <PageHeading level={1}>Manuscripts</PageHeading>
      <Content>
      <Table>
        <Header>
          <tr>
            <SortHeader thisSortName="meta:title">Title</SortHeader>
            <SortHeader thisSortName="created">Submitted</SortHeader>
            <SortHeader thisSortName="status">Status</SortHeader>
            <SortHeader thisSortName="submitterId">Author</SortHeader>
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
      </Content>
    </Container>
  )
}

export default Manuscripts