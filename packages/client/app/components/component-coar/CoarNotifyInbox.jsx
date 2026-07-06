/* eslint-disable react/prop-types */
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import CoarMessages from '../component-review/src/components/coar/CoarMessages'
import { FlexRow, Pagination, PaginationContainerShadowed } from '../shared'
import Page from '../../ui/shared/Page'
import SearchControl from '../component-manuscripts/src/SearchControl'
import { URI_PAGENUM_PARAM, URI_SEARCH_PARAM } from '../../shared/urlParamUtils'

const SearchRow = styled(FlexRow)`
  justify-content: flex-end;
`

// type CoarNotifyMessageProps = {
// 	id: string
//   manuscriptId: string | null
//   manuscript: any // Manuscript
//   payload: string
//   groupId: string | null
//   created: Date
// }

// type CoarNotifyInboxProps = {
//   config: any
//   loading: boolean
//   messages: CoarNotifyMessageProps[]
//   onResendCoarNotifyPayload?: (
//     payload: string,
//   ) => Promise<{ reason?: string | null; success: boolean }>
// }

const CoarNotifyInbox = ({
  applyQueryParams,
  config = {},
  currentSearchPage,
  currentSearchQuery,
  loading,
  messageLimit,
  messages,
  onResendCoarNotifyPayload,
  totalMessageCount,
}) => {
  const { t } = useTranslation()

  return (
    <Page title={t('leftMenu.CoarNotifyInbox')}>
      <div>
        <SearchRow>
          <SearchControl
            applySearchQuery={newQuery =>
              applyQueryParams({
                [URI_PAGENUM_PARAM]: 1,
                [URI_SEARCH_PARAM]: newQuery,
              })
            }
            currentSearchQuery={currentSearchQuery}
          />
        </SearchRow>
        <div>
          <CoarMessages
            collapsible
            config={config}
            loading={loading}
            messages={messages}
            onResendCoarNotifyPayload={onResendCoarNotifyPayload}
          />
          {!loading && (
            <Pagination
              limit={messageLimit}
              page={currentSearchPage}
              PaginationContainer={PaginationContainerShadowed}
              setPage={newPage =>
                applyQueryParams({ [URI_PAGENUM_PARAM]: newPage })
              }
              totalCount={totalMessageCount}
            />
          )}
        </div>
      </div>
    </Page>
  )
}

export default CoarNotifyInbox
