/* eslint-disable react/prop-types */

import React, { useContext } from 'react'
import { gql, useQuery } from '@apollo/client'
import styled from 'styled-components'

import { serverUrl } from '@coko/client'

import AvatarImage from './image'
import { Container, AvatarLink, OnlineIndicator } from './style'
import ConditionalWrap from '../../ConditionalWrap'
import { ConfigContext } from '../../config/src'

export const GET_USER = gql`
  query user($id: ID, $username: String) {
    user(id: $id, username: $username) {
      id
      username
      profilePicture
      isOnline
    }
  }
`
const UserHoverProfile = styled.div``

const GetUserByUsername = props => {
  const { username, showHoverProfile = true } = props
  const { data } = useQuery(GET_USER, { variables: { username } })

  if (!data || !data.user) return null
  return (
    <ConditionalWrap
      condition={showHoverProfile}
      /* eslint-disable-next-line react/no-unstable-nested-components */
      wrap={() => (
        <UserHoverProfile username={username}>
          <Avatar user={data.user} {...props} />
        </UserHoverProfile>
      )}
    >
      <Avatar user={data.user} {...props} />
    </ConditionalWrap>
  )
}

const Avatar = props => {
  const config = useContext(ConfigContext)
  const { urlFrag } = config

  const {
    user,
    dataCy,
    size = 32,
    mobilesize,
    style,
    showOnlineStatus = true,
    isClickable = true,
    onlineBorderColor = null,
  } = props

  const src = user?.profilePicture

  const userFallback = `${serverUrl}/profiles/default_avatar.svg`

  const source = [src, userFallback]

  return (
    <Container
      data-cy={dataCy}
      mobileSize={mobilesize}
      size={size}
      style={style}
      type="user"
    >
      {showOnlineStatus && user?.isOnline && (
        <OnlineIndicator onlineBorderColor={onlineBorderColor} />
      )}
      <ConditionalWrap
        condition={!!user?.username && isClickable}
        /* eslint-disable-next-line react/no-unstable-nested-components */
        wrap={() => (
          <AvatarLink to={`${urlFrag}/profile/${user?.id}`}>
            <AvatarImage
              mobilesize={mobilesize}
              size={size}
              src={source}
              type="user"
            />
          </AvatarLink>
        )}
      >
        <AvatarImage
          mobilesize={mobilesize}
          size={size}
          src={source}
          type="user"
        />
      </ConditionalWrap>
    </Container>
  )
}

const AvatarHandler = props => {
  const {
    showHoverProfile = true,
    isClickable,
    user,
    size = 32,
    username,
  } = props

  if (user) {
    return (
      <ConditionalWrap
        condition={showHoverProfile}
        /* eslint-disable-next-line react/no-unstable-nested-components */
        wrap={() => (
          <UserHoverProfile username={user.username}>
            <Avatar size={size} {...props} />
          </UserHoverProfile>
        )}
      >
        <Avatar size={size} {...props} />
      </ConditionalWrap>
    )
  }

  if (!user && username) {
    return <GetUserByUsername isClickable={isClickable} username={username} />
  }

  return <Avatar {...props} />
}

export default AvatarHandler
