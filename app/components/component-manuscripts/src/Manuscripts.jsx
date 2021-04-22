import React, { useEffect, useState } from 'react'
import { useQuery } from '@apollo/client'
import { Button } from '@pubsweet/ui'
import config from 'config'

import Manuscript from './Manuscript'
import {
  Container,
  ManuscriptsTable,
  Header,
  ScrollableContent,
  Heading,
  Carets,
  CaretUp,
  CaretDown,
  Spinner,
  Pagination,
} from './style'
import { HeadingWithAction } from '../../shared'
import { GET_MANUSCRIPTS } from '../../../queries'
import getQueryStringByName from '../../../shared/getQueryStringByName'
import { PaginationContainerShadowed } from '../../shared/Pagination'

const urlFrag = config.journal.metadata.toplevel_urlfragment

const Manuscripts = ({ history, ...props }) => {
  const SortHeader = ({ thisSortName, children }) => {
    if (!thisSortName) {
      return <th>{children}</th>
    }

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

  const [selectedTopic, setSelectedTopic] = useState(
    getQueryStringByName('topic'),
  )

  const limit = 10
  const sort = sortName && sortDirection && `${sortName}_${sortDirection}`

  const { loading, error, data, refetch } = useQuery(GET_MANUSCRIPTS, {
    variables: {
      sort,
      offset: (page - 1) * limit,
      limit,
      filter: history.location.search
        ? { submission: JSON.stringify({ topics: selectedTopic }) }
        : {},
    },
    fetchPolicy: 'network-only',
  })

  useEffect(() => {
    refetch()
  }, [history.location.search])

  if (loading) return <Spinner />
  if (error) return `Error! ${error.message}`

  const manuscripts = data.paginatedManuscripts.manuscripts.map(el => {
    return { ...el, submission: JSON.parse(el.submission) }
  })

  const { totalCount } = data.paginatedManuscripts

  return (
    <Container>
      {['elife', 'ncrc'].includes(process.env.INSTANCE_NAME) && (
        <HeadingWithAction>
          <Heading>Manuscripts</Heading>
          <Button
            onClick={() => history.push(`${urlFrag}/newSubmission`)}
            primary
          >
            ＋ New submission
          </Button>
        </HeadingWithAction>
      )}

      {['aperture', 'colab'].includes(process.env.INSTANCE_NAME) && (
        <Heading>Manuscripts</Heading>
      )}

      <ScrollableContent>
        <ManuscriptsTable>
          <Header>
            <tr>
              {['aperture', 'colab'].includes(process.env.INSTANCE_NAME) && (
                <SortHeader thisSortName="meta:title">Title</SortHeader>
              )}
              {['elife'].includes(process.env.INSTANCE_NAME) && (
                <SortHeader thisSortName="submission:articleId">
                  Article Id
                </SortHeader>
              )}
              {['ncrc'].includes(process.env.INSTANCE_NAME) && (
                <SortHeader thisSortName="submission:articleDescription">
                  Description
                </SortHeader>
              )}
              <SortHeader thisSortName="created">Created</SortHeader>
              <SortHeader thisSortName="updated">Updated</SortHeader>
              {process.env.INSTANCE_NAME === 'ncrc' && (
                <SortHeader>Topic</SortHeader>
              )}
              <SortHeader thisSortName="status">Status</SortHeader>
              {process.env.INSTANCE_NAME === 'ncrc' && (
                <SortHeader thisSortName="submission:labels">Label</SortHeader>
              )}
              <SortHeader thisSortName="submitterId">Author</SortHeader>
              <th />
            </tr>
          </Header>
          <tbody>
            {manuscripts.map((manuscript, key) => {
              const latestVersion =
                manuscript.manuscriptVersions?.[0] || manuscript

              return (
                <Manuscript
                  history={history}
                  key={latestVersion.id}
                  manuscript={latestVersion}
                  manuscriptId={manuscript.id}
                  number={key + 1}
                  setSelectedTopic={setSelectedTopic}
                  submitter={manuscript.submitter}
                />
              )
            })}
          </tbody>
        </ManuscriptsTable>
      </ScrollableContent>
      <Pagination
        limit={limit}
        page={page}
        PaginationContainer={PaginationContainerShadowed}
        setPage={setPage}
        totalCount={totalCount}
      />
    </Container>
  )
}

export default Manuscripts
