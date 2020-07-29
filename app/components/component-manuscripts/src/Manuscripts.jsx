import React, { useState } from 'react'
import gql from 'graphql-tag'
import { useQuery } from '@apollo/client'

import Manuscript from './Manuscript'
import {
  Container,
  Table,
  Header,
  Content,
  Heading,
  Carets,
  CaretUp,
  CaretDown,
  Spinner,
  Pagination,
} from './style'

const GET_MANUSCRIPTS = gql`
  query Manuscripts(
    $sort: String
    $filter: ManuscriptsFilter
    $offset: Int
    $limit: Int
  ) {
    paginatedManuscripts(
      sort: $sort
      filter: $filter
      offset: $offset
      limit: $limit
    ) {
      totalCount
      manuscripts {
        id
        meta {
          manuscriptId
          title
        }
        created
        updated
        status
        submitter {
          username
          online
          defaultIdentity {
            id
            name
          }
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
    fetchPolicy: 'network-only',
  })

  if (loading) return <Spinner />
  if (error) return `Error! ${error.message}`

  const { manuscripts, totalCount } = data.paginatedManuscripts

  return (
    <Container>
      <Heading>Manuscripts</Heading>
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
              <Manuscript
                key={manuscript.id}
                manuscript={manuscript}
                number={key + 1}
              />
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
