import React from 'react'
import { th, grid } from '@pubsweet/ui-toolkit'
import styled, { css } from 'styled-components'
import Messages from '../../app/components/component-chat/src/Messages/Messages'
import ChatInput from '../../app/components/component-chat/src/SuperChatInput/SuperChatInput'

const MessageContainer = styled.section`
  background: rgb(255, 255, 255);
  display: grid;
  min-width: 100%;
  min-height: 650px;

  ${props =>
    props.channels
      ? css`
          grid-template-rows: ${grid(5)} 1fr calc(${th('gridUnit')} * 8);
        `
      : css`
          grid-template-rows: 1fr calc(${th('gridUnit')} * 8);
        `}

  ${props =>
    props.channels
      ? css`
          grid-template-areas:
            'channels'
            'read'
            'write';
        `
      : css`
          grid-template-areas:
            'read'
            'write';
        `}
`

export const Base = args => (
  <>
    <MessageContainer>
      <Messages {...props} />
      <ChatInput {...props} />
    </MessageContainer>
  </>
)

const props = {
  channelId: '8542101c-fc13-4d3f-881f-67243beaf83a',
  networkOnline: true,
  websocketConnection: 'connected',
  queryData: {
    loading: false,
    data: {
      messages: {
        __typename: 'MessagesRelay',
        edges: [
          {
            __typename: 'Message',
            id: 'b52bfcee-768b-4a6b-9216-bf32fd943757',
            content: 'sample',
            created: '2022-01-06T18:45:07.732Z',
            updated: '2022-01-06T18:45:07.732Z',
            user: {
              __typename: 'User',
              id: '20ca2a8d-d78e-4260-baed-86369992353f',
              username: 'Shanthi',
              profilePicture: null,
              online: null,
            },
          },
          {
            __typename: 'Message',
            id: 'bbfa1a08-7cca-4b2c-aef0-419780422b6e',
            content: 'q',
            created: '2022-01-06T18:47:55.795Z',
            updated: '2022-01-06T18:47:55.795Z',
            user: {
              __typename: 'User',
              id: '20ca2a8d-d78e-4260-baed-86369992353f',
              username: 'Shanthi',
              profilePicture: null,
              online: null,
            },
          },
          {
            __typename: 'Message',
            id: '23b38c29-ecec-4b7c-b6fe-1cb6eb044079',
            content: '1',
            created: '2022-01-06T18:48:04.484Z',
            updated: '2022-01-06T18:48:04.484Z',
            user: {
              __typename: 'User',
              id: '20ca2a8d-d78e-4260-baed-86369992353f',
              username: 'Shanthi',
              profilePicture: null,
              online: null,
            },
          },
          {
            __typename: 'Message',
            id: 'd840f43f-edcd-4caa-9947-fc1b8a7a8c3b',
            content: '1',
            created: '2022-01-06T18:48:17.778Z',
            updated: '2022-01-06T18:48:17.778Z',
            user: {
              __typename: 'User',
              id: '20ca2a8d-d78e-4260-baed-86369992353f',
              username: 'Shanthi',
              profilePicture: null,
              online: null,
            },
          },
          {
            __typename: 'Message',
            id: 'ddf549c6-309f-479c-b48e-fb8139b4143b',
            content: '1',
            created: '2022-01-06T18:48:20.482Z',
            updated: '2022-01-06T18:48:20.482Z',
            user: {
              __typename: 'User',
              id: '20ca2a8d-d78e-4260-baed-86369992353f',
              username: 'Shanthi',
              profilePicture: null,
              online: null,
            },
          },
          {
            __typename: 'Message',
            id: '48c66cc6-9da3-40c4-b11f-a90d5a5112b5',
            content: '1',
            created: '2022-01-06T18:48:22.869Z',
            updated: '2022-01-06T18:48:22.869Z',
            user: {
              __typename: 'User',
              id: '20ca2a8d-d78e-4260-baed-86369992353f',
              username: 'Shanthi',
              profilePicture: null,
              online: null,
            },
          },
          {
            __typename: 'Message',
            id: '40a5a27b-7e49-44e4-af52-f5ff303cec0e',
            content: '1',
            created: '2022-01-06T18:48:26.857Z',
            updated: '2022-01-06T18:48:26.857Z',
            user: {
              __typename: 'User',
              id: '20ca2a8d-d78e-4260-baed-86369992353f',
              username: 'Shanthi',
              profilePicture: null,
              online: null,
            },
          },
        ],
        pageInfo: {
          __typename: 'PageInfo',
          startCursor: 'b52bfcee-768b-4a6b-9216-bf32fd943757',
          hasPreviousPage: false,
        },
      },
    },
    error: undefined,
    currentUser: {
      __typename: 'User',
      id: '20ca2a8d-d78e-4260-baed-86369992353f',
      profilePicture: null,
      username: 'Shanthi',
      admin: true,
      email: 'shanthitestemail@maiiinator.com',
      defaultIdentity: {
        __typename: 'Identity',
        identifier: '0000-0002-2473-4784',
        email: null,
        type: 'orcid',
        aff: '',
        id: '661c6b4f-5b5b-4ef0-aa4e-7d7b5bb38628',
      },
      online: null,
      _currentRoles: [
        {
          __typename: 'CurrentRole',
          id: '297574d0-686c-4b1e-9cbc-3f3d8d86f8e2',
          roles: ['author'],
        },
      ],
      teams: [
        {
          __typename: 'Team',
          id: '0e7766d4-350b-4179-88b4-3eefea1f884e',
          manuscript: {
            __typename: 'Manuscript',
            id: '297574d0-686c-4b1e-9cbc-3f3d8d86f8e2',
            status: 'new',
          },
          members: [
            {
              __typename: 'TeamMember',
              status: null,
              user: {
                __typename: 'User',
                id: '20ca2a8d-d78e-4260-baed-86369992353f',
              },
            },
          ],
        },
      ],
    },
  },
}

Base.args = props

export default {
  title: 'Manuscripts/Chat',
  component: MessageContainer,
  argTypes: {},
}
