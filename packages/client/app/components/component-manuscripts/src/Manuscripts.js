/* eslint-disable no-shadow */
import React, { useContext, useState } from 'react'
import styled from 'styled-components'
import { Checkbox, Dropdown } from '@pubsweet/ui'
import { grid } from '@pubsweet/ui-toolkit'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { Trans, useTranslation } from 'react-i18next'
import { color } from '../../../theme'

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

const DropdownContainer = styled.div`
  width: 100px;

  button {
    background: ${props => (props.disabled ? color.gray90 : color.brand1.base)};
    color: ${props => (props.disabled ? color.gray60 : color.white)};
    line-height: calc(8px * 2);
    min-width: calc(8px * 10);
    padding: 5px 4px;

    span {
      float: none;
      font-size: 14px;
    }
  }

  ul {
    width: 90px;

    li {
      font-size: 14px;
    }
  }

  svg {
    height: calc(3 * 6px);
    margin-top: -3px;
    stroke: ${props => (props.disabled ? color.gray60 : color.white)};
    width: calc(3 * 6px);
  }
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
    unsetCustomStatus,
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
    exportManuscriptsToJson,
    chatExpand,
  } = props

  const { t } = useTranslation()

  const config = useContext(ConfigContext)

  const channelData = chatProps?.channelsData?.find(
    channel => channel?.channelId === groupManagerDiscussionChannel?.id,
  )

  const [isOpenBulkArchiveModal, setIsOpenBulkArchiveModal] = useState(false)

  const [selectedNewManuscripts, setSelectedNewManuscripts] = useState([])

  const [isAdminChatOpen, setIsAdminChatOpen] = useState(
    currentUser.chatExpanded,
  )

  const toggleNewManuscriptCheck = id => {
    setSelectedNewManuscripts(s => {
      const result = selectedNewManuscripts.includes(id)
        ? s.filter(manuscriptId => manuscriptId !== id)
        : [...s, id]

      return result
    })
  }

  const toggleAllNewManuscriptsCheck = () => {
    const newManuscriptsFromCurrentPageIds = manuscripts.map(
      manuscript => manuscript.id,
    )

    const isEveryNewManuscriptIsSelectedFromCurrentPage = manuscripts.every(
      manuscript => selectedNewManuscripts.includes(manuscript.id),
    )

    setSelectedNewManuscripts(currentSelectedManuscripts => {
      const result = isEveryNewManuscriptIsSelectedFromCurrentPage
        ? currentSelectedManuscripts.filter(selectedManuscript => {
            if (newManuscriptsFromCurrentPageIds.includes(selectedManuscript))
              return false
            return true
          })
        : [
            ...new Set([
              ...currentSelectedManuscripts,
              ...manuscripts.map(manuscript => manuscript.id),
            ]),
          ]

      return result
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
    unsetCustomStatus,
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

  if (['lab'].includes(config.instanceName)) {
    adjustedColumnNames.push('publishArticle')
  }

  adjustedColumnNames.splice(0, 0, 'rowItemCheckbox')

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
      chatExpand({ variables: { state: false } })
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

  const topRightControls = (
    <ControlsContainer>
      {config?.manuscript?.newSubmission && (
        <ActionButton
          onClick={() => history.push(`${urlFrag}/newSubmission`)}
          primary
        >
          {t(
            `dashboardPage.New ${
              ['lab'].includes(config.instanceName) ? 'Article' : 'submission'
            }`,
          )}
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
          onClick={() => {
            setIsAdminChatOpen(true)
            chatExpand({ variables: { state: true } })
          }}
          title={t('chat.Show group manager discussion')}
          unreadMessagesCount={channelData?.unreadMessagesCount}
        />
      )}
    </ControlsContainer>
  )

  const actionDropDownOptions = [
    {
      id: 1,
      onClick: () => {
        openModalBulkArchiveConfirmation()
      },
      title: t('manuscriptsPage.Archive'),
    },
    {
      id: 2,
      onClick: () => {
        exportManuscriptsToJson(selectedNewManuscripts)
      },
      title: t('manuscriptsPage.exportAsJson'),
    },
  ]

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

          <FlexRowWithSmallGapAbove>
            <SelectAllField>
              <Checkbox
                checked={manuscripts.every(manuscript =>
                  selectedNewManuscripts.includes(manuscript.id),
                )}
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
              <DropdownContainer disabled={selectedNewManuscripts.length === 0}>
                <Dropdown itemsList={actionDropDownOptions} primary>
                  {t('manuscriptsPage.takeAction')}
                </Dropdown>
              </DropdownContainer>
            </SelectAllField>
          </FlexRowWithSmallGapAbove>

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
      <Modal
        isOpen={isOpenBulkArchiveModal}
        onRequestClose={closeModalBulkArchiveConfirmation}
      >
        <BulkArchiveModal
          closeModal={closeModalBulkArchiveConfirmation}
          confirmBulkArchive={doConfirmBulkArchive}
        />
      </Modal>
    </OuterContainer>
  )
}

export default Manuscripts
