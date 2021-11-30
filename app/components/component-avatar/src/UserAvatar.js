/* eslint-disable react/prop-types */

import * as React from 'react'
import { gql, useQuery } from '@apollo/client'
import styled from 'styled-components'
import AvatarImage from './image'
import { Container, AvatarLink, OnlineIndicator } from './style'
import ConditionalWrap from '../../ConditionalWrap'

export const GET_USER = gql`
  query user($id: ID, $username: String) {
    user(id: $id, username: $username) {
      id
      username
      profilePicture
      online
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
      wrap={() => (
        <UserHoverProfile username={props.username}>
          <Avatar user={data.user} {...props} />
        </UserHoverProfile>
      )}
    >
      <Avatar user={data.user} {...props} />
    </ConditionalWrap>
  )
}

const Avatar = props => {
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

  const src = user.profilePicture

  const userFallback = '/profiles/default_avatar.svg'

  const source = [src, userFallback]

  return (
    <Container
      data-cy={dataCy}
      mobileSize={mobilesize}
      size={size}
      style={style}
      type="user"
    >
      {showOnlineStatus && user.online && (
        <OnlineIndicator onlineBorderColor={onlineBorderColor} />
      )}
      <ConditionalWrap
        condition={!!user.username && isClickable}
        wrap={() => (
          <AvatarLink to={`/users/${user.username}`}>
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
  const { showHoverProfile = true, isClickable, user, username } = props

  if (user) {
    return (
      <ConditionalWrap
        condition={showHoverProfile}
        wrap={() => (
          <UserHoverProfile username={user.username}>
            <Avatar {...props} />
          </UserHoverProfile>
        )}
      >
        <Avatar {...props} />
      </ConditionalWrap>
    )
  }

  if (!user && username) {
    return <GetUserByUsername isClickable={isClickable} username={username} />
  }

  return null
}

export default AvatarHandler
