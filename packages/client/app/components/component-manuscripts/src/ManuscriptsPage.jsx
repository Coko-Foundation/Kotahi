import { useState, useContext } from 'react'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useSubscription } from '@apollo/client/react'
import fnv from 'fnv-plus'
import { ConfigContext } from '../../config/src'
import {
  IMPORT_MANUSCRIPTS,
  IMPORTED_MANUSCRIPTS,
  GET_SYSTEM_WIDE_DISCUSSION_CHANNEL,
  EXPAND_CHAT,
} from '../../../queries'
import Manuscripts from './Manuscripts'
import useChat from '../../../hooks/useChat'
import { useCurrentUser } from '../../../pages/hooks/useCurrentUser'

const ManuscriptsPage = () => {
  const { t } = useTranslation()
  const currentUser = useCurrentUser()

  const config = useContext(ConfigContext)
  const chatRoomId = fnv.hash(config.clientUrl).hex()

  const [isImporting, setIsImporting] = useState(false)

  // GET_SYSTEM_WIDE_DISCUSSION_ID
  const systemWideDiscussionChannel = useQuery(
    GET_SYSTEM_WIDE_DISCUSSION_CHANNEL,
    {
      variables: { groupId: config.groupId },
    },
  )

  useSubscription(IMPORTED_MANUSCRIPTS, {
    onSubscriptionData: data => {
      const {
        subscriptionData: {
          data: { manuscriptsImportStatus },
        },
      } = data

      setIsImporting(false)

      toast.success(
        manuscriptsImportStatus && 'Manuscripts successfully imported',
        { hideProgressBar: true },
      )
    },
  })

  const [importManuscripts] = useMutation(IMPORT_MANUSCRIPTS)

  const importManuscriptsAndRefetch = async () => {
    setIsImporting(true)

    await importManuscripts({
      variables: {
        groupId: config.groupId,
      },
    })
  }

  const [chatExpand] = useMutation(EXPAND_CHAT)

  const shouldAllowBulkImport = config?.manuscript?.manualImport

  const groupManagerDiscussionChannel =
    systemWideDiscussionChannel?.data?.systemWideDiscussionChannel

  const { hideDiscussionFromGroupAdminsManagers } =
    config?.discussionChannel || {}

  const channels = [
    ...(hideDiscussionFromGroupAdminsManagers
      ? []
      : [
          {
            id: groupManagerDiscussionChannel?.id,
            name: t('chat.Group Manager discussion'),
            type: groupManagerDiscussionChannel?.type,
          },
        ]),
  ]

  const chatProps = useChat(channels)

  return (
    <Manuscripts
      channels={channels}
      chatExpand={chatExpand}
      chatProps={chatProps}
      chatRoomId={chatRoomId}
      currentUser={currentUser}
      groupManagerDiscussionChannel={groupManagerDiscussionChannel}
      hideManuscriptsChat={hideDiscussionFromGroupAdminsManagers}
      importManuscripts={importManuscriptsAndRefetch}
      isImporting={isImporting}
      shouldAllowBulkImport={shouldAllowBulkImport}
    />
  )
}

export default ManuscriptsPage
