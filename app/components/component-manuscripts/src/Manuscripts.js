/* eslint-disable no-shadow */
import React, { useEffect, useState } from 'react'
import { ToastContainer, toast } from 'react-toastify'
import { get } from 'lodash'
import 'react-toastify/dist/ReactToastify.css'
import { useQuery, useMutation, useSubscription } from '@apollo/client'
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
  TableHeader,
} from './style'
import { HeadingWithAction, Select, CommsErrorBanner } from '../../shared'
import {
  GET_MANUSCRIPTS_AND_FORM,
  DELETE_MANUSCRIPTS,
  IMPORT_MANUSCRIPTS,
  IMPORTED_MANUSCRIPTS_SUBSCRIPTION,
} from '../../../queries'
import getQueryStringByName from '../../../shared/getQueryStringByName'
import { PaginationContainerShadowed } from '../../shared/Pagination'
import { articleStatuses } from '../../../globals'
import VideoChatButton from './VideoChatButton'
import { updateMutation } from '../../component-submit/src/components/SubmitPage'
import Modal from '../../component-modal/src'
import BulkDeleteModal from './BulkDeleteModal'
import manuscriptsTableConfig from './manuscriptsTableConfig'
import submissionForm from '../../../storage/forms-ncrc/submit.json'

const topics = submissionForm.children.find(el => {
  return el.title === 'Topics'
}).options

const firstColumnWidth =
  process.env.INSTANCE_NAME === 'ncrc'
    ? process.env.MANUSCRIPTS_TABLE_FIRST_COLUMN_WIDTH
    : '150px'
// eslint-disable-next-line
console.log(
  'firstColumnWidth',
  process.env.MANUSCRIPTS_TABLE_FIRST_COLUMN_WIDTH,
)

const urlFrag = config.journal.metadata.toplevel_urlfragment

const updateUrlParameter = (url, param, value) => {
  const regex = new RegExp(`(${param}=)[^&]+`)
  return url.replace(regex, `$1${value}`)
}

const renderManuscriptsTableHeaders = ({
  SortHeader,
  selectedStatus,
  selectedTopic,
  selectedLabel,
  filterByArticleLabel,
  filterByArticleStatus,
  filterByTopic,
}) => {
  const renderActions = {
    'meta.title': () => {
      return (
        <SortHeader key="title" thisSortName="meta:title">
          Title
        </SortHeader>
      )
    },
    'submission.articleId': () => {
      return (
        <SortHeader key="id" thisSortName="submission:articleId">
          Article Id
        </SortHeader>
      )
    },
    'submission.articleDescription': () => {
      return (
        <SortHeader key="desc" thisSortName="submission:articleDescription">
          Description
        </SortHeader>
      )
    },
    'submission.journal': () => {
      return (
        <SortHeader
          cursor="pointer"
          key="journal"
          thisSortName="submission:journal"
        >
          Journal
        </SortHeader>
      )
    },
    created: () => {
      return (
        <SortHeader key="created" thisSortName="created">
          Created
        </SortHeader>
      )
    },
    updated: () => {
      return (
        <SortHeader key="updated" thisSortName="updated">
          Updated
        </SortHeader>
      )
    },
    'submission.topics': () => {
      return process.env.INSTANCE_NAME === 'ncrc' ? (
        <SortHeader key="topics">
          <Select
            aria-label="Topic"
            data-testid="topics"
            label="Topic"
            onChange={selected => filterByTopic(selected.value)}
            options={[
              {
                label: 'Select...',
                value: '',
              },
              ...topics,
            ]}
            placeholder="Topic"
            value={selectedTopic}
          />
        </SortHeader>
      ) : (
        <SortHeader key="topic">Topic</SortHeader>
      )
    },
    status: () => {
      return ['aperture', 'ncrc'].includes(process.env.INSTANCE_NAME) ? (
        <SortHeader key="status">
          <Select
            aria-label="Status"
            data-testid="status"
            label="Status"
            onChange={selected => filterByArticleStatus(selected.value)}
            options={[
              { label: 'Select...', value: '' },
              { label: 'Unsubmitted', value: 'new' },
              { label: 'Submitted', value: 'submitted' },
              { label: 'Evaluated', value: 'evaluated' },
              { label: 'Published', value: 'published' },
            ]}
            placeholder="Status"
            value={selectedStatus}
          />
        </SortHeader>
      ) : (
        <SortHeader key="status" thisSortName="status">
          Status
        </SortHeader>
      )
    },
    'submission.labels': () => {
      return process.env.INSTANCE_NAME === 'ncrc' ? (
        <SortHeader key="labels">
          <Select
            aria-label="Labels"
            data-testid="labels"
            label="Label"
            onChange={selected => filterByArticleLabel(selected.value)}
            options={[
              {
                label: 'Select...',
                value: '',
              },
              {
                label: 'Ready to evaluate',
                value: 'readyToEvaluate',
              },
              {
                label: 'Evaluated',
                value: 'evaluated',
              },
              {
                label: 'Ready to publish',
                value: 'readyToPublish',
              },
            ]}
            placeholder="Labels"
            value={selectedLabel}
          />
        </SortHeader>
      ) : (
        <SortHeader key="label">Label</SortHeader>
      )
    },
    author: () => {
      return (
        <SortHeader key="author" thisSortName="submitterId">
          Author
        </SortHeader>
      )
    },
    editor: () => {
      return <SortHeader key="editor">Editor</SortHeader>
    },
  }

  return fieldName => {
    if (get(renderActions, fieldName)) {
      return get(renderActions, fieldName)()
    }

    return <SortHeader key={fieldName}>{fieldName}</SortHeader>
  }
}

const Manuscripts = ({ history, ...props }) => {
  const SortHeader = ({ thisSortName, children, cursor }) => {
    if (!thisSortName) {
      return <TableHeader cursor={cursor}>{children}</TableHeader>
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
      <TableHeader cursor={cursor} onClick={changeSort}>
        {children} {UpDown()}
      </TableHeader>
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
  const [isOpenBulkDeletionModal, setIsOpenBulkDeletionModal] = useState(false)

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

  const filterArticle = (propertyName, propertyValue, updateFn) => {
    const currentURL = window.location.href.split('?')

    if (currentURL.length === 1) {
      currentURL.push('')
    }

    let updatedQueryString = currentURL[1].includes(`${propertyName}=`)
      ? updateUrlParameter(currentURL[1], propertyName, propertyValue)
      : `${currentURL[1]}&${propertyName}=${propertyValue}`

    if (!propertyValue) {
      updatedQueryString = updatedQueryString.replace(`&${propertyName}=`, '')
    }

    updateFn(propertyValue)
    history.replace(`/kotahi/admin/manuscripts?${updatedQueryString}`)
  }

  const filterByTopic = topic => {
    filterArticle('topic', topic, setSelectedTopic)
  }

  const filterByArticleStatus = status => {
    filterArticle('status', status, setSelectedStatus)
  }

  const filterByArticleLabel = label => {
    filterArticle('label', label, setSelectedLabel)
  }

  const toggleNewManuscriptCheck = id => {
    setSelectedNewManuscripts(s => {
      return selectedNewManuscripts.includes(id)
        ? s.filter(manuscriptId => manuscriptId !== id)
        : [...s, id]
    })
  }

  const toggleAllNewManuscriptsCheck = () => {
    const newManuscriptsFromCurrentPage = manuscripts.filter(
      manuscript =>
        manuscript.status === articleStatuses.new &&
        !manuscript.submission.labels,
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
                .filter(
                  manuscript =>
                    manuscript.status === articleStatuses.new &&
                    !manuscript.submission.labels,
                )
                .map(manuscript => manuscript.id),
            ]),
          ]
    })
  }

  const limit = process.env.INSTANCE_NAME === 'ncrc' ? 100 : 10
  const sort = sortName && sortDirection && `${sortName}_${sortDirection}`

  const { loading, error, data, refetch } = useQuery(GET_MANUSCRIPTS_AND_FORM, {
    variables: {
      sort,
      offset: (page - 1) * limit,
      limit,
      filter: searchHandler(),
    },
    fetchPolicy: 'network-only',
  })

  useSubscription(IMPORTED_MANUSCRIPTS_SUBSCRIPTION, {
    onSubscriptionData: data => {
      const {
        subscriptionData: {
          data: { manuscriptsImportStatus },
        },
      } = data

      toast.success(
        manuscriptsImportStatus && 'Manuscripts successfully imported',
      )
    },
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

  const [update] = useMutation(updateMutation)

  const resetFilters = () => {
    if (history.location.search === '') {
      setSelectedTopic('')
      setSelectedStatus('')
      setSelectedLabel('')
    }
  }

  useEffect(() => {
    refetch()
    setPage(1)
    resetFilters()
  }, [history.location.search])

  if (loading) return <Spinner />
  if (error) return <CommsErrorBanner error={error} />

  const manuscripts = data.paginatedManuscripts.manuscripts.map(el => {
    return { ...el, submission: JSON.parse(el.submission) }
  })

  const fieldDefinitions = {}
  const fields = data.formForPurpose?.structure?.children ?? []
  fields.forEach(field => {
    if (field.name) fieldDefinitions[field.name] = field // Incomplete fields in the formbuilder may not have a name specified. Ignore these
  })

  const { totalCount } = data.paginatedManuscripts

  const setReadyToEvaluateLabel = id => {
    if (selectedNewManuscripts.includes(id)) {
      toggleNewManuscriptCheck(id)
    }

    return update({
      variables: {
        id,
        input: JSON.stringify({
          submission: {
            labels: 'readyToEvaluate',
          },
        }),
      },
    })
  }

  // eslint-disable-next-line no-unused-vars
  const bulkSetLabelReadyToEvaluate = (selectedNewManuscripts, manuscripts) => {
    manuscripts
      .filter(manuscript => !selectedNewManuscripts.includes(manuscript.id))
      .forEach(manuscript => {
        setReadyToEvaluateLabel(manuscript.id)
      })
  }

  const openModalBulkDeleteConfirmation = () => {
    setIsOpenBulkDeletionModal(true)
  }

  const closeModalBulkDeleteConfirmation = () => {
    setIsOpenBulkDeletionModal(false)
  }

  const confirmBulkDelete = () => {
    // bulkSetLabelReadyToEvaluate(selectedNewManuscripts, manuscripts) // Disable until requirements are clearer. See #602
    deleteManuscripts({
      variables: { ids: selectedNewManuscripts },
    })
    setSelectedNewManuscripts([])
    closeModalBulkDeleteConfirmation()
  }

  const renderManuscriptsTableHeader = renderManuscriptsTableHeaders({
    SortHeader,
    selectedTopic,
    selectedStatus,
    selectedLabel,
    filterByTopic,
    filterByArticleStatus,
    filterByArticleLabel,
  })

  return (
    <Container>
      <ToastContainer
        autoClose={5000}
        closeOnClick
        draggable
        hideProgressBar={false}
        newestOnTop={false}
        pauseOnFocusLoss
        pauseOnHover
        position="top-center"
        rtl={false}
      />
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

            {['ncrc'].includes(process.env.INSTANCE_NAME) && (
              <StyledButton onClick={importManuscripts} primary>
                Refresh
              </StyledButton>
            )}
          </div>
        </HeadingWithAction>
      )}

      {['aperture', 'colab'].includes(process.env.INSTANCE_NAME) && (
        <HeadingWithAction>
          <Heading>Manuscripts</Heading>
          {['colab'].includes(process.env.INSTANCE_NAME) && (
            <StyledButton onClick={importManuscripts} primary>
              Refresh
            </StyledButton>
          )}
        </HeadingWithAction>
      )}

      {['ncrc', 'colab'].includes(process.env.INSTANCE_NAME) && (
        <SelectAllField>
          <Checkbox
            checked={
              manuscripts.filter(
                manuscript =>
                  manuscript.status === articleStatuses.new &&
                  !manuscript.submission.labels,
              ).length ===
                manuscripts.filter(manuscript =>
                  selectedNewManuscripts.includes(manuscript.id),
                ).length && selectedNewManuscripts.length !== 0
            }
            label="Select All"
            onChange={toggleAllNewManuscriptsCheck}
          />
          <SelectedManuscriptsNumber>{`${selectedNewManuscripts.length} articles selected`}</SelectedManuscriptsNumber>
          <Button
            disabled={selectedNewManuscripts.length === 0}
            onClick={openModalBulkDeleteConfirmation}
            primary
          >
            Delete
          </Button>
        </SelectAllField>
      )}

      <ScrollableContent>
        <ManuscriptsTable>
          <colgroup>
            <col style={{ width: firstColumnWidth }} />
            <col />
            <col />
            <col />
            <col />
            <col />
            <col />
          </colgroup>
          <Header>
            <tr>
              {manuscriptsTableConfig.map(field => {
                return renderManuscriptsTableHeader(field)
              })}
              {/* eslint-disable-next-line */}
              <th></th>
            </tr>
          </Header>
          <tbody style={{ backgroundColor: 'white' }}>
            {manuscripts.map((manuscript, key) => {
              const latestVersion =
                manuscript.manuscriptVersions?.[0] || manuscript

              return (
                <Manuscript
                  fieldDefinitions={fieldDefinitions}
                  filterArticle={filterArticle}
                  filterByArticleLabel={filterByArticleLabel}
                  filterByArticleStatus={filterByArticleStatus}
                  filterByTopic={filterByTopic}
                  history={history}
                  key={latestVersion.id}
                  manuscript={latestVersion}
                  manuscriptId={manuscript.id}
                  number={key + 1}
                  selectedLabel={selectedLabel}
                  selectedNewManuscripts={selectedNewManuscripts}
                  selectedStatus={selectedStatus}
                  selectedTopic={selectedTopic}
                  setReadyToEvaluateLabel={setReadyToEvaluateLabel}
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
      {['ncrc', 'colab'].includes(process.env.INSTANCE_NAME) && (
        <Modal
          isOpen={isOpenBulkDeletionModal}
          onRequestClose={closeModalBulkDeleteConfirmation}
        >
          <BulkDeleteModal
            closeModal={closeModalBulkDeleteConfirmation}
            confirmBulkDelete={confirmBulkDelete}
          />
        </Modal>
      )}
    </Container>
  )
}

export default Manuscripts
