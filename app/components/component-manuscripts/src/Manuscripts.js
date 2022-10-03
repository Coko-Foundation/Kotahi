/* eslint-disable no-shadow */
import React, { useState } from 'react'
import styled from 'styled-components'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { Checkbox } from '@pubsweet/ui'
import { grid } from '@pubsweet/ui-toolkit'
import ManuscriptRow from './ManuscriptRow'
import {
  ManuscriptsTable,
  ManuscriptsHeaderRow,
  SelectAllField,
  SelectedManuscriptsNumber,
  ControlsContainer,
} from './style'
import {
  Container,
  Spinner,
  ScrollableContent,
  Heading,
  CommsErrorBanner,
  Pagination,
  PaginationContainerShadowed,
  Columns,
  RoundIconButton,
  ActionButton,
} from '../../shared'
import { articleStatuses } from '../../../globals'
import MessageContainer from '../../component-chat/src/MessageContainer'
import Modal from '../../component-modal/src'
import BulkArchiveModal from './BulkArchiveModal'
import getColumnsProps from './getColumnsProps'
import getUriQueryParams from './getUriQueryParams'
import FilterSortHeader from './FilterSortHeader'
import SearchControl from './SearchControl'
import { validateManuscriptSubmission } from '../../../shared/manuscriptUtils'

const URI_SEARCH_PARAM = 'search'

const OuterContainer = styled(Container)`
  overflow: hidden;
  padding: 0;
`

const ManuscriptsPane = styled.div`
  overflow-y: scroll;
  padding: 16px 16px 0 16px;
`

const FlexRow = styled.div`
  display: flex;
  gap: ${grid(1)};
  justify-content: space-between;
`

const FlexRowWithSmallGapAbove = styled(FlexRow)`
  margin-top: 10px;
`

const Manuscripts = ({ history, ...props }) => {
  const {
    validateDoi,
    setReadyToEvaluateLabels,
    deleteManuscriptMutations,
    importManuscripts,
    isImporting,
    publishManuscripts,
    setSortName,
    setSortDirection,
    setPage,
    queryObject,
    sortDirection,
    sortName,
    systemWideDiscussionChannel,
    confrimBulkDelete,
    page,
    urlFrag,
    chatRoomId,
    configuredColumnNames,
    shouldAllowBulkImport,
    archiveManuscriptMutations,
    confirmBulkArchive,
  } = props

  const [isOpenBulkDeletionModal, setIsOpenBulkDeletionModal] = useState(false)

  const [isOpenBulkArchiveModal, setIsOpenBulkArchiveModal] = useState(false)

  const [selectedNewManuscripts, setSelectedNewManuscripts] = useState([])
  const [isAdminChatOpen, setIsAdminChatOpen] = useState(true)

  const uriQueryParams = getUriQueryParams(window.location)

  const loadPageWithQuery = query => {
    let newPath = `${urlFrag}/admin/manuscripts`

    if (query.length > 0) {
      newPath = `${newPath}?${query
        .filter(x => x.value)
        .map(
          param =>
            `${encodeURIComponent(param.field)}=${encodeURIComponent(
              param.value,
            )}`,
        )
        .join('&')}`
    }

    history.replace(newPath)
  }

  const setFilter = (fieldName, filterValue) => {
    if (fieldName === URI_SEARCH_PARAM) return // In case a field happens to have the same name as the GET param we use for search
    const revisedQuery = [...uriQueryParams].filter(x => x.field !== fieldName)
    revisedQuery.push({ field: fieldName, value: filterValue })
    loadPageWithQuery(revisedQuery)
  }

  const applySearchQuery = query => {
    const revisedQuery = [...uriQueryParams].filter(
      x => x.field !== URI_SEARCH_PARAM,
    )

    revisedQuery.push({ field: URI_SEARCH_PARAM, value: query })
    loadPageWithQuery(revisedQuery)
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

  const { loading, error, data } = queryObject

  const deleteManuscript = id => deleteManuscriptMutations(id)

  const archiveManuscript = id => archiveManuscriptMutations(id)

  const [
    manuscriptsBlockedFromPublishing,
    setManuscriptsBlockedFromPublishing,
  ] = useState([])

  const isManuscriptBlockedFromPublishing = id =>
    manuscriptsBlockedFromPublishing.includes(id)

  /** Put a block on the ID while validating and publishing; then unblock it. If the ID is already blocked, do nothing. */
  const tryPublishManuscript = async manuscript => {
    if (isManuscriptBlockedFromPublishing(manuscript.id)) return
    setManuscriptsBlockedFromPublishing(
      manuscriptsBlockedFromPublishing.concat([manuscript.id]),
    )

    const hasInvalidFields = await validateManuscriptSubmission(
      manuscript.submission,
      data.formForPurposeAndCategory?.structure,
      validateDoi,
    )

    if (hasInvalidFields.filter(Boolean).length === 0) {
      await publishManuscripts(manuscript.id)
      setManuscriptsBlockedFromPublishing(
        manuscriptsBlockedFromPublishing.filter(id => id !== manuscript.id),
      )
    }
  }

  if (loading) return <Spinner />
  if (error) return <CommsErrorBanner error={error} />

  const manuscripts = data.paginatedManuscripts.manuscripts.map(m => {
    return {
      ...m,
      submission: JSON.parse(m.submission),
      manuscriptVersions: m.manuscriptVersions?.map(v => ({
        ...v,
        submission: JSON.parse(v.submission),
      })),
    }
  })

  const fieldDefinitions = {}
  const fields = data.formForPurposeAndCategory?.structure?.children ?? []
  fields.forEach(field => {
    if (field.name) fieldDefinitions[field.name] = field // Incomplete fields in the formbuilder may not have a name specified. Ignore these
  })

  const { totalCount } = data.paginatedManuscripts

  const setReadyToEvaluateLabel = id => {
    if (selectedNewManuscripts.includes(id)) {
      toggleNewManuscriptCheck(id)
    }

    return setReadyToEvaluateLabels(id)
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
    confrimBulkDelete(selectedNewManuscripts)

    setSelectedNewManuscripts([])
    closeModalBulkDeleteConfirmation()
  }

  const openModalBulkArchiveConfirmation = () => {
    setIsOpenBulkArchiveModal(true)
  }

  const closeModalBulkArchiveConfirmation = () => {
    setIsOpenBulkArchiveModal(false)
  }

  const confirmsBulkArchive = () => {
    confirmBulkArchive(selectedNewManuscripts)

    setSelectedNewManuscripts([])
    closeModalBulkArchiveConfirmation()
  }

  const currentSearchQuery = uriQueryParams.find(
    x => x.field === URI_SEARCH_PARAM,
  )?.value

  const columnsProps = getColumnsProps(
    configuredColumnNames,
    fieldDefinitions,
    uriQueryParams,
    sortName,
    sortDirection,
    deleteManuscript,
    isManuscriptBlockedFromPublishing,
    tryPublishManuscript,
    selectedNewManuscripts,
    toggleNewManuscriptCheck,
    setReadyToEvaluateLabel,
    urlFrag,
    currentSearchQuery,
    archiveManuscript,
  )

  const channels = [
    {
      id: systemWideDiscussionChannel?.data?.systemWideDiscussionChannel?.id,
      name: 'Admin discussion',
    },
  ]

  const hideChat = () => setIsAdminChatOpen(false)

  const shouldAllowNewSubmission = ['elife', 'ncrc'].includes(
    process.env.INSTANCE_NAME,
  )

  const shouldAllowBulkDelete = ['ncrc', 'colab'].includes(
    process.env.INSTANCE_NAME,
  )

  const topRightControls = (
    <ControlsContainer>
      {shouldAllowNewSubmission && (
        <ActionButton
          onClick={() => history.push(`${urlFrag}/newSubmission`)}
          primary
        >
          ＋ New submission
        </ActionButton>
      )}
      {shouldAllowBulkImport && (
        <ActionButton
          onClick={importManuscripts}
          status={isImporting ? 'pending' : ''}
        >
          {isImporting ? 'Refreshing' : 'Refresh'}
        </ActionButton>
      )}

      <SearchControl
        applySearchQuery={applySearchQuery}
        currentSearchQuery={currentSearchQuery}
      />
      {!isAdminChatOpen && (
        <RoundIconButton
          iconName="MessageSquare"
          onClick={() => setIsAdminChatOpen(true)}
          title="Show admin discussion"
        />
      )}
    </ControlsContainer>
  )

  return (
    <OuterContainer>
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
      <Columns>
        <ManuscriptsPane>
          <FlexRow>
            <Heading>Manuscripts</Heading>
            {topRightControls}
          </FlexRow>
          {shouldAllowBulkDelete && (
            <FlexRowWithSmallGapAbove>
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
                <ActionButton
                  disabled={selectedNewManuscripts.length === 0}
                  isCompact
                  onClick={openModalBulkArchiveConfirmation}
                  primary={selectedNewManuscripts.length > 0}
                >
                  Archive
                </ActionButton>
              </SelectAllField>
            </FlexRowWithSmallGapAbove>
          )}

          <div>
            <ScrollableContent>
              <ManuscriptsTable>
                <ManuscriptsHeaderRow>
                  {columnsProps.map(info => (
                    <FilterSortHeader
                      columnInfo={info}
                      key={info.name}
                      setFilter={setFilter}
                      setSortDirection={setSortDirection}
                      setSortName={setSortName}
                      sortDirection={sortDirection}
                      sortName={sortName}
                    />
                  ))}
                </ManuscriptsHeaderRow>
                {manuscripts.map((manuscript, key) => {
                  const latestVersion =
                    manuscript.manuscriptVersions?.[0] || manuscript

                  return (
                    <ManuscriptRow
                      columnDefinitions={columnsProps}
                      key={latestVersion.id}
                      manuscript={latestVersion}
                      setFilter={setFilter}
                    />
                  )
                })}
              </ManuscriptsTable>
            </ScrollableContent>
            <Pagination
              limit={limit}
              page={page}
              PaginationContainer={PaginationContainerShadowed}
              setPage={setPage}
              totalCount={totalCount}
            />
          </div>
        </ManuscriptsPane>

        {/* Admin Discussion, Video Chat, Hide Chat, Chat component */}
        {isAdminChatOpen && (
          <MessageContainer
            channelId={
              systemWideDiscussionChannel?.data?.systemWideDiscussionChannel?.id
            }
            channels={channels}
            chatRoomId={chatRoomId}
            hideChat={hideChat}
          />
        )}
      </Columns>
      {['ncrc', 'colab'].includes(process.env.INSTANCE_NAME) && (
        <Modal
          isOpen={isOpenBulkArchiveModal}
          onRequestClose={closeModalBulkArchiveConfirmation}
        >
          <BulkArchiveModal
            closeModal={closeModalBulkArchiveConfirmation}
            confirmBulkDelete={confirmBulkDelete}
            confirmsBulkArchive={confirmsBulkArchive}
          />
        </Modal>
      )}
    </OuterContainer>
  )
}

export default Manuscripts
