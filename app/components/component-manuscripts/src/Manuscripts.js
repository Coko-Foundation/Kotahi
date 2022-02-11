/* eslint-disable no-shadow */
import React, { useState } from 'react'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { Button, Checkbox } from '@pubsweet/ui'
import ManuscriptRow from './ManuscriptRow'
import {
  ManuscriptsTable,
  ManuscriptsHeaderRow,
  SelectAllField,
  SelectedManuscriptsNumber,
  FloatRightButton,
  Loader,
  RefreshSpinnerWrapper,
  RefreshText,
} from './style'
import {
  Container,
  Spinner,
  ScrollableContent,
  Heading,
  CommsErrorBanner,
  Pagination,
  PaginationContainerShadowed,
} from '../../shared'
import { articleStatuses } from '../../../globals'
import VideoChatButton from './VideoChatButton'
import Modal from '../../component-modal/src'
import BulkDeleteModal from './BulkDeleteModal'
import getColumnsProps from './getColumnsProps'
import getUriQueryParams from './getUriQueryParams'
import FilterSortHeader from './FilterSortHeader'
import { validateManuscript } from '../../../shared/manuscriptUtils'

const Manuscripts = ({ history, ...props }) => {
  const {
    client,
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
    confrimBulkDelete,
    page,
    urlFrag,
    chatRoomId,
    configuredColumnNames,
  } = props

  const [isOpenBulkDeletionModal, setIsOpenBulkDeletionModal] = useState(false)
  const [selectedNewManuscripts, setSelectedNewManuscripts] = useState([])

  const uriQueryParams = getUriQueryParams(window.location)

  const loadPageWithQuery = query => {
    let newPath = `${urlFrag}/admin/manuscripts`

    if (query.length > 0) {
      newPath = `${newPath}?${query
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
    let revisedQuery = [...uriQueryParams].filter(x => x.field !== fieldName)
    revisedQuery.push({ field: fieldName, value: filterValue })
    revisedQuery = revisedQuery.filter(x => !!x.value)
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

    const hasInvalidFields = await validateManuscript(
      manuscript.submission,
      fieldDefinitions,
      client,
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
  const fields = data.formForPurpose?.structure?.children ?? []
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
  )

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
      <VideoChatButton chatRoomId={chatRoomId} />
      {['elife', 'ncrc'].includes(process.env.INSTANCE_NAME) && (
        <FloatRightButton
          onClick={() => history.push(`${urlFrag}/newSubmission`)}
          primary
        >
          ＋ New submission
        </FloatRightButton>
      )}
      {['ncrc', 'colab'].includes(process.env.INSTANCE_NAME) && (
        <FloatRightButton
          disabled={isImporting}
          onClick={importManuscripts}
          primary
        >
          {isImporting ? (
            <RefreshSpinnerWrapper>
              <RefreshText>Refreshing</RefreshText> <Loader />
            </RefreshSpinnerWrapper>
          ) : (
            'Refresh'
          )}
        </FloatRightButton>
      )}
      <Heading>Manuscripts</Heading>

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
