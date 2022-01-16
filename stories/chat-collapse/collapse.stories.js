/* eslint-disable import/order */
import React from 'react'
import styled, { css } from 'styled-components'
import { th, grid } from '@pubsweet/ui-toolkit'
import Menu from '../../app/components/Menu'
import {
  ManuscriptsTable,
  ManuscriptsHeaderRow,
} from '../../app/components/component-manuscripts/src/style'
import FilterSortHeader from '../../app/components/component-manuscripts/src/FilterSortHeader'
import ManuscriptRow from '../../app/components/component-manuscripts/src/ManuscriptRow'
import DefaultField from '../../app/components/component-manuscripts/src/cell-components/DefaultField'
import Messages from '../../app/components/component-chat/src/Messages/Messages'
import { Heading } from '../../app/components/shared'
import ChatInput from '../../app/components/component-chat/src/SuperChatInput/SuperChatInput'

const DragIcon = styled.div`
  width: max-content;
  padding: 10px 20px;
  border: 1px solid #e5e5e5;
  border-radius: 10px;
  left: -15px;
  position: relative;
  background: #fff;
  cursor: pointer;
  color: linear-gradient(
    134deg,
    #3aae2a,
    hsl(112.69999999999999, 61.1%, 59.6%)
  );
  z-index: 100000000000;
`

const DragIconWrap = styled.div`
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 0px;
`

const TableTitleElements = [
  {
    name: 'shortId',
    title: 'Manuscript number',
    defaultSortDirection: 'DESC',
    flex: '0 1 6em',
    canSort: true,
    filterValue: null,
    sortDirection: null,
  },
  {
    name: 'meta.title',
    title: 'Title',
    defaultSortDirection: 'ASC',
    flex: '1 0.5 16em',
    canSort: true,
    filterOptions: null,
    filterValue: null,
    sortDirection: null,
  },
  {
    name: 'created',
    title: 'Created',
    defaultSortDirection: 'DESC',
    flex: '0 1 7em',
    canSort: true,
    filterValue: null,
    sortDirection: 'DESC',
  },
  {
    name: 'updated',
    title: 'Updated',
    defaultSortDirection: 'DESC',
    flex: '0 1 7em',
    canSort: true,
    filterValue: null,
    sortDirection: null,
  },
  {
    name: 'status',
    title: 'Status',
    defaultSortDirection: null,
    flex: '0 1 10em',
    filterOptions: [
      {
        label: 'Unsubmitted',
        value: 'new',
      },
      {
        label: 'Submitted',
        value: 'submitted',
      },
      {
        label: 'Accepted',
        value: 'accepted',
      },
      {
        label: 'Rejected',
        value: 'rejected',
      },
      {
        label: 'Revise',
        value: 'revise',
      },
      {
        label: 'Revising',
        value: 'revising',
      },
      {
        label: 'Published',
        value: 'published',
      },
    ],
    canSort: false,
    filterValue: null,
    sortDirection: null,
  },
  {
    name: 'author',
    title: 'Author',
    defaultSortDirection: null,
    flex: '0 1 16em',
    canSort: false,
    filterValue: null,
    sortDirection: null,
  },
  {
    name: 'actions',
    title: '',
    defaultSortDirection: null,
    flex: '0 1 6em',
    extraProps: {},
    canSort: false,
    filterValue: null,
    sortDirection: null,
  },
]

const Root = styled.div`
  display: grid;
  grid-template-areas: 'menu main';
  grid-template-columns: 200px auto;
  height: 100vh;
  max-height: 100vh;
  border-right: 1px solid #e5e5e5;
  ${({ converting }) =>
    converting &&
    `
     button,
     a {
       pointer-events: none;
     }
  `};
  overflow: hidden;
  position: relative;
  z-index: 0;
`

const MessageContainers = styled.section`
  background: rgb(255, 255, 255);
  display: grid;
  /* min-width: 100%; */
  z-index: 1000;
  background: #e5e5e5;
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

const Columns = styled.div`
  display: grid;
  grid-template-areas: 'manuscript chat';
  grid-template-columns: ${props => (props.collapse ? '8fr 0fr' : '6fr 2fr')};
  height: 100vh;
  justify-content: center;
  overflow: hidden;
  margin: 10px;
  width: 100%;
`

export const Base = args => (
  <>
    <Root>
      <Menu {...args} />
      <div>
        <Heading>Manuscripts</Heading>
        <Columns collapse={args.data}>
          <div
            style={{
              display: 'flex',
            }}
          >
            <ManuscriptsTable>
              <ManuscriptsHeaderRow>
                {TableTitleElements?.map(info => (
                  <FilterSortHeader
                    columnInfo={info}
                    key={info.name}
                    sortDirection={info.sortDirection}
                    sortName="created"
                  />
                ))}
              </ManuscriptsHeaderRow>
              <ManuscriptRow {...args} />
            </ManuscriptsTable>
            <DragIconWrap>
              {args.data ? (
                <DragIcon onClick={() => alert('icon clicked')}>{`<`}</DragIcon>
              ) : (
                <DragIcon onClick={() => alert('icon clicked')}>{`>`}</DragIcon>
              )}
            </DragIconWrap>
          </div>
          <div
            style={{
              display: args.data ? 'none' : 'flex',
              transition: 'display 0s, opacity 0.5s linear',
              // right: args.data ? '400px' : '0px',
              // position: 'relative',
            }}
          >
            <MessageContainers>
              <Messages {...args} />
              <ChatInput {...args} />
            </MessageContainers>
          </div>
        </Columns>
      </div>
    </Root>
  </>
)

Base.args = {
  brand: 'Kotahi',
  brandLink: '/kotahi/dashboard',
  className: '',
  loginLink: '/login?next=/kotahi/dashboard',
  navLinkComponents: [
    {
      link: '/kotahi/dashboard',
      name: 'Dashboard',
      icon: 'home',
    },
    {
      link: '/kotahi/admin/form-builder',
      name: 'Forms',
      icon: 'check-square',
    },
    {
      link: '/kotahi/admin/users',
      name: 'Users',
      icon: 'users',
    },
    {
      link: '/kotahi/admin/manuscripts',
      name: 'Manuscripts',
      icon: 'file-text',
    },
    {
      link: '/kotahi/admin/reports',
      name: 'Reports',
      icon: 'activity',
    },
    {
      link: '/kotahi/profile',
      name: 'My profile',
      icon: 'user',
    },
  ],
  notice: ' ',
  profileLink: '/kotahi/profile',
  user: {
    __typename: 'User',
    id: 'ed0d6990-b32a-4b32-8bf6-39bd20078643',
    profilePicture: null,
    username: 'Shanthi',
    admin: true,
    email: 'shanthitestemail@mailinator.com',
    defaultIdentity: {
      __typename: 'Identity',
      identifier: '0000-0002-2473-4784',
      email: null,
      type: 'orcid',
      aff: '',
      id: '7b03f794-ed3c-4dac-933d-a6616b3d70c2',
    },
    online: true,
    _currentRoles: [],
    teams: [],
  },
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
            content:
              'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
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
  columnDefinitions: [
    {
      name: 'shortId',
      title: 'Manuscript number',
      defaultSortDirection: 'DESC',
      flex: '0 1 6em',
      canSort: true,
      filterValue: null,
      sortDirection: null,
      component: DefaultField,
    },
    {
      name: 'meta.title',
      title: 'Title',
      defaultSortDirection: 'ASC',
      flex: '1 0.5 16em',
      canSort: true,
      filterOptions: null,
      filterValue: null,
      sortDirection: null,
      component: DefaultField,
    },
    {
      name: 'created',
      title: 'Created',
      defaultSortDirection: 'DESC',
      flex: '0 1 7em',
      canSort: true,
      filterValue: null,
      sortDirection: 'DESC',
      component: DefaultField,
    },
    {
      name: 'updated',
      title: 'Updated',
      defaultSortDirection: 'DESC',
      flex: '0 1 7em',
      canSort: true,
      filterValue: null,
      sortDirection: null,
      component: DefaultField,
    },
    {
      name: 'status',
      title: 'Status',
      defaultSortDirection: null,
      flex: '0 1 10em',
      filterOptions: [
        {
          label: 'Unsubmitted',
          value: 'new',
        },
        {
          label: 'Submitted',
          value: 'submitted',
        },
        {
          label: 'Accepted',
          value: 'accepted',
        },
        {
          label: 'Rejected',
          value: 'rejected',
        },
        {
          label: 'Revise',
          value: 'revise',
        },
        {
          label: 'Revising',
          value: 'revising',
        },
        {
          label: 'Published',
          value: 'published',
        },
      ],
      canSort: false,
      filterValue: null,
      sortDirection: null,
      component: DefaultField,
    },
    {
      name: 'author',
      title: 'Author',
      defaultSortDirection: null,
      flex: '0 1 16em',
      canSort: false,
      filterValue: null,
      sortDirection: null,
      component: DefaultField,
    },
    {
      name: 'actions',
      title: '',
      defaultSortDirection: null,
      flex: '0 1 6em',
      extraProps: {},
      canSort: false,
      filterValue: null,
      sortDirection: null,
      component: DefaultField,
    },
  ],
  manuscript: {
    __typename: 'Manuscript',
    id: '297574d0-686c-4b1e-9cbc-3f3d8d86f8e2',
    shortId: 2,
    meta: {
      __typename: 'ManuscriptMeta',
      manuscriptId: '297574d0-686c-4b1e-9cbc-3f3d8d86f8e2',
      title: 'New submission 1/7/2022, 12:13:19 AM',
    },
    submission: {
      irb: 'yes',
      name: 'shanthi',
      cover:
        '<p class="paragraph"><strong>Lorem Ipsum</strong>&nbsp;is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</p>',
      links: [],
      title: '',
      ethics:
        '<p class="paragraph"><strong>Lorem Ipsum</strong>&nbsp;is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</p>',
      contact: 'shanthitestemail@mailinator.com',
      methods: ['PET', 'Diffusion MRI', 'Behavior'],
      abstract:
        '<p class="paragraph"><strong>Lorem Ipsum</strong>&nbsp;is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</p>',
      datacode:
        '<p class="paragraph"><strong>Lorem Ipsum</strong>&nbsp;is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</p>',
      humanMRI: '2T',
      keywords: 'Data and Code availability statements',
      packages: ['Free Surfer', 'SPM'],
      subjects: 'healthy_subjects',
      suggested: 'shanthitestemail@mailinator.com',
      objectType: 'software',
      references:
        '<p class="paragraph"><strong>Lorem Ipsum</strong>&nbsp;is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</p>',
      affiliation: 'Research Object Submission Form',
      otherMethods:
        'Cover letter describing submission, relevant implications, and timely information to consider',
      humanMRIother:
        'Cover letter describing submission, relevant implications, and timely information to consider',
      otherPackages:
        'Cover letter describing submission, relevant implications, and timely information to consider',
      animal_research_approval: 'N/A',
    },
    created: '2022-01-06T18:43:19.372Z',
    updated: '2022-01-06T18:44:34.915Z',
    status: 'new',
    published: null,
    teams: [
      {
        __typename: 'Team',
        id: '0e7766d4-350b-4179-88b4-3eefea1f884e',
        role: 'author',
        members: [
          {
            __typename: 'TeamMember',
            id: 'e51bb0ef-100e-4256-85ce-389c7702abbc',
            user: {
              __typename: 'User',
              id: '20ca2a8d-d78e-4260-baed-86369992353f',
              username: 'Shanthi',
            },
          },
        ],
      },
    ],
    manuscriptVersions: [],
    submitter: {
      __typename: 'User',
      username: 'Shanthi',
      online: null,
      defaultIdentity: {
        __typename: 'Identity',
        id: '661c6b4f-5b5b-4ef0-aa4e-7d7b5bb38628',
        identifier: '0000-0002-2473-4784',
        name: 'Shanthi ',
      },
      profilePicture: null,
    },
  },
  data: true,
}

export default {
  title: 'Manuscripts/Collapse',
  component: Root,
}
