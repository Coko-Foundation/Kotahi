import React, { useEffect, useState } from 'react'
import { useQuery, useMutation } from '@apollo/client'
import { Button, Checkbox } from '@pubsweet/ui'
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
  SelectAllField,
  SelectedManuscriptsNumber,
  StyledButton,
} from './style'
import { HeadingWithAction } from '../../shared'
import {
  GET_MANUSCRIPTS,
  DELETE_MANUSCRIPTS,
  IMPORT_MANUSCRIPTS,
} from '../../../queries'
import getQueryStringByName from '../../../shared/getQueryStringByName'
import { PaginationContainerShadowed } from '../../shared/Pagination'
import { articleStatuses } from '../../../globals'
import VideoChatButton from './VideoChatButton'

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

      return null
    }

    return (
      <th onClick={changeSort}>
        {children} {UpDown()}
      </th>
    )
  }

  const searchHandler = () => {
    const searchQuery = history.location.search
    const filterQuery = { submission: {} }

    if (searchQuery && searchQuery.includes('status')) {
      filterQuery.status = selectedStatus
    }

    if (searchQuery && searchQuery.includes('topic')) {
      filterQuery.submission.topics = selectedTopic
    }

    if (searchQuery && searchQuery.includes('label')) {
      filterQuery.submission.label = selectedLabel
    }

    return {
      ...filterQuery,
      submission: JSON.stringify(filterQuery.submission),
    }
  }

  const [sortName, setSortName] = useState('created')
  const [sortDirection, setSortDirection] = useState('DESC')
  const [page, setPage] = useState(1)

  const [selectedTopic, setSelectedTopic] = useState(
    getQueryStringByName('topic'),
  )

  const [selectedStatus, setSelectedStatus] = useState(
    getQueryStringByName('status'),
  )

  const [selectedLabel, setSelectedLabel] = useState(
    getQueryStringByName('label'),
  )

  const [selectedNewManuscripts, setSelectedNewManuscripts] = useState([])

  const toggleNewManuscriptCheck = id => {
    setSelectedNewManuscripts(s => {
      return selectedNewManuscripts.includes(id)
        ? s.filter(manuscriptId => manuscriptId !== id)
        : [...s, id]
    })
  }

  const toggleAllNewManuscriptsCheck = () => {
    const newManuscriptsFromCurrentPage = manuscripts.filter(
      manuscript => manuscript.status === articleStatuses.new,
    )

    const newManuscriptsFromCurrentPageIds = newManuscriptsFromCurrentPage.map(
      manuscript => manuscript.id,
    )

    const isEveryNewManuscriptIsSelectedFromCurrentPage = newManuscriptsFromCurrentPage.every(
      manuscript => selectedNewManuscripts.includes(manuscript.id),
    )

    setSelectedNewManuscripts(currentSelectedManuscripts => {
      return isEveryNewManuscriptIsSelectedFromCurrentPage
        ? currentSelectedManuscripts.filter(selectedManuscript => {
            if (newManuscriptsFromCurrentPageIds.includes(selectedManuscript))
              return false
            return true
          })
        : [
            ...new Set([
              ...currentSelectedManuscripts,
              ...manuscripts
                .filter(manuscript => manuscript.status === articleStatuses.new)
                .map(manuscript => manuscript.id),
            ]),
          ]
    })
  }

  const limit = 10
  const sort = sortName && sortDirection && `${sortName}_${sortDirection}`

  const { loading, error, data, refetch } = useQuery(GET_MANUSCRIPTS, {
    variables: {
      sort,
      offset: (page - 1) * limit,
      limit,
      filter: searchHandler(),
    },
    fetchPolicy: 'network-only',
  })

  const [importManuscripts] = useMutation(IMPORT_MANUSCRIPTS)

  const [deleteManuscripts] = useMutation(DELETE_MANUSCRIPTS, {
    // eslint-disable-next-line no-shadow
    update(cache, { data: { selectedNewManuscripts } }) {
      const ids = cache.identify({
        __typename: 'Manuscript',
        id: selectedNewManuscripts,
      })

      cache.evict({ ids })
    },
  })

  useEffect(() => {
    refetch()
    setPage(1)
  }, [history.location.search])

  if (loading) return <Spinner />
  if (error) return `Error! ${error.message}`

  const manuscripts = data.paginatedManuscripts.manuscripts.map(el => {
    return { ...el, submission: JSON.parse(el.submission) }
  })

  const { totalCount } = data.paginatedManuscripts

  return (
    <Container>
      <VideoChatButton />
      {['elife', 'ncrc'].includes(process.env.INSTANCE_NAME) && (
        <HeadingWithAction>
          <Heading>Manuscripts</Heading>
          <div>
            <StyledButton
              onClick={() => history.push(`${urlFrag}/newSubmission`)}
              primary
            >
              ＋ New submission
            </StyledButton>

            {process.env.INSTANCE_NAME === 'ncrc' && (
              <StyledButton onClick={importManuscripts} primary>
                Refresh
              </StyledButton>
            )}
          </div>
        </HeadingWithAction>
      )}

      {['aperture', 'colab'].includes(process.env.INSTANCE_NAME) && (
        <Heading>Manuscripts</Heading>
      )}

      {['ncrc'].includes(process.env.INSTANCE_NAME) && (
        <SelectAllField>
          <Checkbox
            checked={
              manuscripts.filter(
                manuscript => manuscript.status === articleStatuses.new,
              ).length ===
              manuscripts.filter(manuscript =>
                selectedNewManuscripts.includes(manuscript.id),
              ).length
            }
            label="Select All"
            onChange={toggleAllNewManuscriptsCheck}
          />
          <SelectedManuscriptsNumber>{`${selectedNewManuscripts.length} articles selected`}</SelectedManuscriptsNumber>
          <Button
            onClick={() => {
              deleteManuscripts({ variables: { ids: selectedNewManuscripts } })
              setSelectedNewManuscripts([])
            }}
            primary
          >
            Delete
          </Button>
        </SelectAllField>
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
              {!['ncrc'].includes(process.env.INSTANCE_NAME) && (
                <SortHeader thisSortName="submitterId">Author</SortHeader>
              )}
              {['ncrc'].includes(process.env.INSTANCE_NAME) && (
                <SortHeader>Editor</SortHeader>
              )}
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
                  selectedNewManuscripts={selectedNewManuscripts}
                  setSelectedLabel={setSelectedLabel}
                  setSelectedStatus={setSelectedStatus}
                  setSelectedTopic={setSelectedTopic}
                  submitter={manuscript.submitter}
                  toggleNewManuscriptCheck={toggleNewManuscriptCheck}
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
