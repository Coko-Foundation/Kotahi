/* stylelint-disable declaration-no-important */
import React, { Fragment, useEffect, useContext } from 'react'
import { useLazyQuery } from '@apollo/client'
import { isEmpty } from 'lodash'
import { useTranslation } from 'react-i18next'
import useNotifications from './hooks/useNotifications'
import { useObject } from '../../hooks/dataTypeHooks'
import { FlexCenter } from '../component-cms-manager/src/style'
import { GET_GROUPS } from '../../queries'
import { ConfigContext } from '../config/src'
import { Content } from './misc/styleds'
import { getUserRecipients, getRoleRecipients } from './misc/helpers'
import EventContent from './components/EventContent'
import { GET_USERS } from '../component-users-manager/src/UsersPage'
import EventsList from './components/EventsList'
import { Spinner } from '../shared'
import { T } from './misc/constants'

const NotificationPage = ({ emailTemplates, wrapper: Root = Fragment }) => {
  const { groupId } = useContext(ConfigContext)
  const { t } = useTranslation()
  const collapsedState = useObject()
  const recipients = useObject()
  const selected = useObject()

  const buildCollapsedState = () => {
    const collapsedStateEntries = events?.map(e => [e.name, true])
    const newCollapsedState = Object.fromEntries(collapsedStateEntries)
    collapsedState.set(newCollapsedState)
  }

  const onCompletedActions = {
    onFetch: buildCollapsedState,
    onCreate: selected.set,
    onUpdate: result => {
      selected.state?.id === result.id && selected.update({ ...result })
    },
    onDelete: id => {
      selected.state?.id === id && selected.clear()
    },
  }

  const graphQL = useNotifications(onCompletedActions)

  const {
    eventsData,
    updateNotification,
    createNotification,
    deleteNotification,
    setEventActive,
    setNotificationActive,
  } = graphQL

  const { loading, error, data } = eventsData ?? {}
  const { events } = data ?? {}

  const [getGroups] = useLazyQuery(GET_GROUPS, {
    onCompleted: getRoleRecipients(groupId, recipients.update),
  })

  const [getUsers] = useLazyQuery(GET_USERS, {
    onCompleted: getUserRecipients(recipients.update),
  })

  const handleActivate = name => {
    setEventActive({ variables: { name } })
  }

  const handleDelete = id => {
    deleteNotification({ variables: { id } })
  }

  const handleToggleActive = id => {
    setNotificationActive({ variables: { id } })
  }

  useEffect(() => {
    if (groupId) {
      getGroups()
      getUsers()
    }
  }, [groupId])

  if (loading) return <Spinner />
  if (error) return <div>Error: {error.message}</div>

  return (
    <Root style={{ '--header-height': '0px' }}>
      <Content>
        {!isEmpty(selected.state) ? (
          <EventContent
            create={createNotification}
            emailTemplates={emailTemplates}
            key={selected.state?.id}
            recipients={recipients.state}
            save={updateNotification}
            selected={selected.state}
          />
        ) : (
          <FlexCenter style={{ width: '100%', height: '100%' }}>
            <p>{t(T.noSelectedEvent)}</p>
          </FlexCenter>
        )}
        <EventsList
          collapsedState={collapsedState}
          events={events}
          handleActivate={handleActivate}
          handleDelete={handleDelete}
          selected={selected}
          toggleActive={handleToggleActive}
        />
      </Content>
    </Root>
  )
}

export default NotificationPage
