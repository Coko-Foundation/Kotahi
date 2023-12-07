/* eslint-disable no-shadow */
import React, { useContext, useState } from 'react'
import styled from 'styled-components'
import { Checkbox } from '@pubsweet/ui'
import { grid } from '@pubsweet/ui-toolkit'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
// eslint-disable-next-line import/no-unresolved
import { Trans, useTranslation } from 'react-i18next'
import { articleStatuses } from '../../../globals'
import { validateManuscriptSubmission } from '../../../shared/manuscriptUtils'
import {
  URI_PAGENUM_PARAM,
  URI_SEARCH_PARAM,
} from '../../../shared/urlParamUtils'
import MessageContainer from '../../component-chat/src/MessageContainer'
import ManuscriptsTable from '../../component-manuscripts-table/src/ManuscriptsTable'
import buildColumnDefinitions from '../../component-manuscripts-table/src/util/buildColumnDefinitions'
import Modal from '../../component-modal/src/ConfirmationModal'
import {
  ActionButton,
  Columns,
  CommsErrorBanner,
  Container,
  Heading,
  Pagination,
  PaginationContainerShadowed,
  RoundIconButton,
  ScrollableContent,
  Spinner,
} from '../../shared'
import BulkArchiveModal from './BulkArchiveModal'
import SearchControl from './SearchControl'
import {
  ControlsContainer,
  SelectAllField,
  SelectedManuscriptsNumber,
} from './style'
import { ConfigContext } from '../../config/src'

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

const RoundIconButtonWrapper = styled(RoundIconButton)`
  position: sticky;
`

const Manuscripts = ({ history, ...props }) => {
  const {
    applyQueryParams,
    validateDoi,
    validateSuffix,
    setReadyToEvaluateLabels,
    deleteManuscriptMutations,
    importManuscripts,
    isImporting,
    publishManuscript,
    queryObject,
    sortDirection,
    sortName,
    page,
    urlFrag,
    chatRoomId,
    configuredColumnNames,
    shouldAllowBulkImport,
    archiveManuscriptMutations,
    confirmBulkArchive,
    uriQueryParams,
    currentUser,
    chatProps,
    groupManagerDiscussionChannel,
    channels,
    doUpdateManuscript,
  } = props

  const { t } = useTranslation()

  const config = useContext(ConfigContext)

  const channelData = chatProps?.channelsData?.find(
    channel => channel?.channelId === groupManagerDiscussionChannel?.id,
  )

  const [isOpenBulkArchiveModal, setIsOpenBulkArchiveModal] = useState(false)

  const [selectedNewManuscripts, setSelectedNewManuscripts] = useState([])
  const [isAdminChatOpen, setIsAdminChatOpen] = useState(false)

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

  const limit = config?.manuscript?.paginationCount

  const { loading, error, data } = queryObject

  const deleteManuscript = id => deleteManuscriptMutations(id)

  const archiveManuscript = id => archiveManuscriptMutations(id)

  const tryPublishManuscript = async manuscript => {
    let result = null

    const hasInvalidFields = await validateManuscriptSubmission(
      manuscript.submission,
      data.formForPurposeAndCategory?.structure,
      validateDoi,
      validateSuffix,
    )

    if (hasInvalidFields.filter(Boolean).length) {
      result = [
        {
          stepLabel: 'publishing',
          errorMessage: t('manuscriptsPage.manuscriptInvalid'),
        },
      ]
    } else {
      result = (await publishManuscript(manuscript.id)).data.publishManuscript
    }

    return result
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

  const openModalBulkArchiveConfirmation = () => {
    setIsOpenBulkArchiveModal(true)
  }

  const closeModalBulkArchiveConfirmation = () => {
    setIsOpenBulkArchiveModal(false)
  }

  const doConfirmBulkArchive = () => {
    confirmBulkArchive(selectedNewManuscripts)

    setSelectedNewManuscripts([])
    closeModalBulkArchiveConfirmation()
  }

  const currentSearchQuery = uriQueryParams.get(URI_SEARCH_PARAM)

  // Props for instantiating special components
  const specialComponentValues = {
    deleteManuscript,
    archiveManuscript,
    tryPublishManuscript,
    selectedNewManuscripts,
    toggleNewManuscriptCheck,
    setReadyToEvaluateLabel,
    urlFrag,
  }

  // Props for filtering / sorting
  const displayProps = {
    uriQueryParams,
    columnToSortOn: sortName,
    sortDirection,
    currentSearchQuery,
  }

  const adjustedColumnNames = [...configuredColumnNames]
  adjustedColumnNames.push('actions')
  if (['preprint2', 'prc'].includes(config.instanceName))
    adjustedColumnNames.splice(0, 0, 'newItemCheckbox')

  // Source of truth for columns
  const columnsProps = buildColumnDefinitions(
    config,
    adjustedColumnNames,
    fieldDefinitions,
    specialComponentValues,
    displayProps,
    doUpdateManuscript,
  )

  const hideChat = async () => {
    try {
      setIsAdminChatOpen(false)

      const { channelsData } = chatProps || {}

      const dataRefetchPromises = channelsData?.map(async channel => {
        await channel?.refetchUnreadMessagesCount?.()
        await channel?.refetchNotificationOptionData?.()
      })

      await Promise.all(dataRefetchPromises)
    } catch (error) {
      console.error('Error hiding chat:', error)
    }
  }

  const shouldAllowBulkDelete = ['preprint2', 'prc'].includes(
    config.instanceName,
  )

  const topRightControls = (
    <ControlsContainer>
      {config?.manuscript?.newSubmission && (
        <ActionButton
          onClick={() => history.push(`${urlFrag}/newSubmission`)}
          primary
        >
          {t('dashboardPage.New submission')}
        </ActionButton>
      )}
      {shouldAllowBulkImport && (
        <ActionButton
          onClick={importManuscripts}
          status={isImporting ? t('manuscriptsPage.importPending') : ''}
        >
          {isImporting
            ? t('manuscriptsPage.Refreshing')
            : t('manuscriptsPage.Refresh')}
        </ActionButton>
      )}

      <SearchControl
        applySearchQuery={newQuery =>
          applyQueryParams({
            [URI_SEARCH_PARAM]: newQuery,
            [URI_PAGENUM_PARAM]: 1,
          })
        }
        currentSearchQuery={currentSearchQuery}
      />
      {!isAdminChatOpen && (
        <RoundIconButtonWrapper
          iconName="MessageSquare"
          onClick={() => setIsAdminChatOpen(true)}
          title={t('chat.Show group manager discussion')}
          unreadMessagesCount={channelData?.unreadMessagesCount}
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
            <Heading>{t('manuscriptsPage.Manuscripts')}</Heading>
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
                  label={t('manuscriptsPage.Select All')}
                  onChange={toggleAllNewManuscriptsCheck}
                />
                <SelectedManuscriptsNumber>
                  <Trans
                    count={selectedNewManuscripts.length}
                    i18nKey="manuscriptsPage.selectedArticles"
                    values={{ count: selectedNewManuscripts.length }}
                  />
                </SelectedManuscriptsNumber>
                <ActionButton
                  disabled={selectedNewManuscripts.length === 0}
                  isCompact
                  onClick={openModalBulkArchiveConfirmation}
                  primary={selectedNewManuscripts.length > 0}
                >
                  {t('manuscriptsPage.Archive')}
                </ActionButton>
              </SelectAllField>
            </FlexRowWithSmallGapAbove>
          )}

          <div>
            <ScrollableContent>
              <ManuscriptsTable
                applyQueryParams={applyQueryParams}
                columnsProps={columnsProps}
                manuscripts={manuscripts}
                sortDirection={sortDirection}
                sortName={sortName}
              />
            </ScrollableContent>
            <Pagination
              limit={limit}
              page={page}
              PaginationContainer={PaginationContainerShadowed}
              setPage={newPage =>
                applyQueryParams({ [URI_PAGENUM_PARAM]: newPage })
              }
              totalCount={totalCount}
            />
          </div>
        </ManuscriptsPane>

        {/* Group Manager Discussion, Video Chat, Hide Chat, Chat component */}
        {isAdminChatOpen && (
          <MessageContainer
            channelId={groupManagerDiscussionChannel?.id}
            channels={channels}
            chatProps={chatProps}
            chatRoomId={chatRoomId}
            currentUser={currentUser}
            hideChat={hideChat}
          />
        )}
      </Columns>
      {['preprint2', 'prc'].includes(config.instanceName) && (
        <Modal
          isOpen={isOpenBulkArchiveModal}
          onRequestClose={closeModalBulkArchiveConfirmation}
        >
          <BulkArchiveModal
            closeModal={closeModalBulkArchiveConfirmation}
            confirmBulkArchive={doConfirmBulkArchive}
          />
        </Modal>
      )}
    </OuterContainer>
  )
}

export default Manuscripts
