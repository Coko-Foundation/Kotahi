/* eslint-disable import/order */
import React from 'react'
import styled, { css } from 'styled-components'
import { th, grid } from '@pubsweet/ui-toolkit'
import Menu from '../../app/components/Menu'
import DefaultField from '../../app/components/component-manuscripts/src/cell-components/DefaultField'
import Manuscripts from '../../app/components/component-manuscripts/src/Manuscripts'
import Chat from '../../app/components/component-chat/src/Chat'

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
        <Columns collapse={args.data}>
          <div
            style={{
              display: 'flex',
            }}
          >
            <Manuscripts {...args} />

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
            }}
          >
            <MessageContainers>
              <Chat {...args} />
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
  channelId: 'fa75c598-ea43-4666-a0e0-67d93d413be2',
  currentUser: {
    __typename: 'User',
    id: '92f99a84-fc8b-4f94-bc9e-10bb3f7c3902',
    profilePicture: null,
    username: 'Harriet Handling-Editor',
    admin: true,
    email: 'shanthitestemail@mailinator.com',
    defaultIdentity: {
      __typename: 'Identity',
      identifier: '0000-0002-4568-451X',
      email: null,
      type: 'orcid',
      aff: '',
      id: 'aeb8257c-2fd4-44b9-a464-0c38e0eae7b5',
    },
    online: null,
    _currentRoles: [
      {
        __typename: 'CurrentRole',
        id: 'b431334f-cd7b-451c-af47-09c6f3931cf8',
        roles: ['author'],
      },
    ],
    teams: [
      {
        __typename: 'Team',
        id: '2de16917-c592-47a3-a15c-a53ee99eca78',
        manuscript: {
          __typename: 'Manuscript',
          id: 'b431334f-cd7b-451c-af47-09c6f3931cf8',
          status: 'new',
        },
        members: [
          {
            __typename: 'TeamMember',
            status: null,
            user: {
              __typename: 'User',
              id: '92f99a84-fc8b-4f94-bc9e-10bb3f7c3902',
            },
          },
        ],
      },
    ],
  },
  networkOnline: true,
  websocketConnection: 'connected',
  queryData: {
    called: true,
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
  queryObject: {
    data: {
      paginatedManuscripts: {
        __typename: 'PaginatedManuscripts',
        totalCount: 1,
        manuscripts: [
          {
            __typename: 'Manuscript',
            id: '130fed3c-f436-4075-9080-b7a51652a8fb',
            shortId: 1,
            meta: {
              __typename: 'ManuscriptMeta',
              manuscriptId: '130fed3c-f436-4075-9080-b7a51652a8fb',
              title: 'New submission 1/26/2022, 1:50:57 AM',
            },
            submission:
              '{"irb":"","name":"","cover":"","links":[],"title":"","ethics":"","contact":"","methods":[],"abstract":"","datacode":"","humanMRI":"","keywords":"","packages":[],"subjects":"","suggested":"","objectType":"","references":"","affiliation":"","otherMethods":"","humanMRIother":"","otherPackages":"","animal_research_approval":""}',
            created: '2022-01-25T20:20:57.340Z',
            updated: '2022-01-25T20:20:57.340Z',
            status: 'new',
            published: null,
            teams: [
              {
                __typename: 'Team',
                id: '97922b55-82fe-4d0a-997b-4f3d3811845a',
                role: 'author',
                members: [
                  {
                    __typename: 'TeamMember',
                    id: '2e5b149e-33ef-41e1-bb52-194630e179b3',
                    user: {
                      __typename: 'User',
                      id: 'fa926e5f-2e6e-4bf6-9f8b-74f3c5b7b2a9',
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
                id: '415d69fa-4e74-4e6d-9286-f5257545127b',
                identifier: '0000-0002-2473-4784',
                name: 'Shanthi ',
              },
              profilePicture: null,
            },
          },
        ],
      },
      formForPurpose: {
        __typename: 'Form',
        structure: {
          __typename: 'FormStructure',
          children: [
            {
              __typename: 'FormElement',
              id: 'bf0c8b8f-7523-4c7d-a74c-7635838f1451',
              component: 'LinksInput',
              name: 'submission.links',
              title: 'Research object links',
              shortDescription: null,
              options: null,
            },
            {
              __typename: 'FormElement',
              id: '47fd802f-ed30-460d-9617-c8a9b9025e95',
              component: 'TextField',
              name: 'meta.title',
              title: 'Title',
              shortDescription: null,
              options: null,
            },
            {
              __typename: 'FormElement',
              id: '62ca72ad-04b0-41fc-85d1-415469d7e895',
              component: 'TextField',
              name: 'submission.name',
              title: 'Name',
              shortDescription: null,
              options: null,
            },
            {
              __typename: 'FormElement',
              id: '1c2e9325-3fa8-41f3-8607-180eb8a25aa3',
              component: 'TextField',
              name: 'submission.affiliation',
              title: 'Affiliation',
              shortDescription: null,
              options: null,
            },
            {
              __typename: 'FormElement',
              id: '7f5aa395-3486-4067-b636-ae204d472c16',
              component: 'TextField',
              name: 'submission.contact',
              title: 'Email and contact information',
              shortDescription: null,
              options: null,
            },
            {
              __typename: 'FormElement',
              id: '347dc171-f008-45ac-8433-ca0711bf213c',
              component: 'AbstractEditor',
              name: 'submission.cover',
              title: 'Cover letter',
              shortDescription: null,
              options: null,
            },
            {
              __typename: 'FormElement',
              id: 'bf2f9b4a-377b-4303-8f51-70d836eb1456',
              component: 'AbstractEditor',
              name: 'submission.datacode',
              title: 'Data and Code availability statements',
              shortDescription: null,
              options: null,
            },
            {
              __typename: 'FormElement',
              id: 'fa5e5b75-4b6f-4a2d-9113-c2b4db73ef8a',
              component: 'AbstractEditor',
              name: 'submission.ethics',
              title: 'Ethics statement',
              shortDescription: null,
              options: null,
            },
            {
              __typename: 'FormElement',
              id: 'fa0c39ca-0486-4e29-ba24-f86f7d375c3f',
              component: 'Select',
              name: 'submission.objectType',
              title: 'Type of Research Object',
              shortDescription: null,
              options: [
                {
                  __typename: 'FormElementOption',
                  id: 'df5fc212-b055-4cba-9d0e-e85222e3d4f2',
                  label: 'Dataset',
                  labelColor: null,
                  value: 'dataset',
                },
                {
                  __typename: 'FormElementOption',
                  id: 'ef2ddada-105a-412e-8d7f-56b1df44c02f',
                  label: 'Software',
                  labelColor: null,
                  value: 'software',
                },
                {
                  __typename: 'FormElementOption',
                  id: '0fafbfc3-6797-46e3-aff4-3fd4f16261b1',
                  label: 'Figure',
                  labelColor: null,
                  value: 'figure',
                },
                {
                  __typename: 'FormElementOption',
                  id: '5117a7c6-2fcf-414b-ac60-47f8d93ccfef',
                  label: 'Notebook',
                  labelColor: null,
                  value: 'notebook',
                },
              ],
            },
            {
              __typename: 'FormElement',
              id: '14b8da7d-5924-4098-8d1f-e528c7c440b9',
              component: 'TextField',
              name: 'submission.suggested',
              title: 'Suggested reviewers',
              shortDescription: null,
              options: null,
            },
            {
              __typename: 'FormElement',
              id: 'b769b4d5-f9b3-48d3-a6d5-77bb6a9e95b0',
              component: 'SupplementaryFiles',
              name: 'fileName',
              title: 'Upload supplementary materials',
              shortDescription: null,
              options: null,
            },
            {
              __typename: 'FormElement',
              id: '6342cff7-c57a-4fd9-b91d-c4cf77b4c309',
              component: 'TextField',
              name: 'submission.keywords',
              title: 'Keywords',
              shortDescription: null,
              options: null,
            },
            {
              __typename: 'FormElement',
              id: 'ebe75cec-0ba8-4f00-9024-20e77ed94f1c',
              component: 'Select',
              name: 'submission.subjects',
              title:
                'Did your study involve healthy subjects only or patients (note that patient studies may also involve healthy subjects)',
              shortDescription: 'Patients/healthy subjects',
              options: [
                {
                  __typename: 'FormElementOption',
                  id: '5fa97761-1b46-4a67-87f6-1dbe772381eb',
                  label: 'Healthy subjects',
                  labelColor: null,
                  value: 'healthy_subjects',
                },
                {
                  __typename: 'FormElementOption',
                  id: '40f48822-786c-46dd-9026-287f96c4929d',
                  label: 'Patients',
                  labelColor: null,
                  value: 'patients',
                },
              ],
            },
            {
              __typename: 'FormElement',
              id: '6871680a-2278-40b3-80c6-7de06f21aafb',
              component: 'Select',
              name: 'submission.irb',
              title:
                'If your research involved human subjects, was the research approved by the relevant Institutional Review Board or ethics panel?',
              shortDescription: 'Ethics panel',
              options: [
                {
                  __typename: 'FormElementOption',
                  id: 'bc2549db-8819-412d-9f36-816c2586ef12',
                  label: 'Yes',
                  labelColor: null,
                  value: 'yes',
                },
                {
                  __typename: 'FormElementOption',
                  id: '91bd7c42-a5e7-4290-a085-65566218df15',
                  label: 'No',
                  labelColor: null,
                  value: 'no',
                },
                {
                  __typename: 'FormElementOption',
                  id: '3e7689c2-2a6a-408e-b57d-680d441cf2e5',
                  label:
                    ' Not applicable (My Research Object does not involve human subjects) ',
                  labelColor: null,
                  value: 'N/A',
                },
              ],
            },
            {
              __typename: 'FormElement',
              id: 'b127ecb1-4862-4662-a958-3266eb284353',
              component: 'Select',
              name: 'submission.animal_research_approval',
              title:
                'Was any animal research approved by the relevant IACUC or other animal research panel?',
              shortDescription: 'Animal research panel',
              options: [
                {
                  __typename: 'FormElementOption',
                  id: 'fd3c8237-d080-43b7-9353-28c16d9bfcfc',
                  label: 'Yes',
                  labelColor: null,
                  value: 'yes',
                },
                {
                  __typename: 'FormElementOption',
                  id: 'de158fbc-a5b5-4c76-bd5a-2c546aa42fee',
                  label: 'No',
                  labelColor: null,
                  value: 'no',
                },
                {
                  __typename: 'FormElementOption',
                  id: '56159591-4c84-434c-b66c-1969b5f7afae',
                  label:
                    ' Not applicable (My Research Object does not involve animal subjects)',
                  labelColor: null,
                  value: 'N/A',
                },
              ],
            },
            {
              __typename: 'FormElement',
              id: '6deaacc6-759a-4a68-b494-c38c664bb665',
              component: 'CheckboxGroup',
              name: 'submission.methods',
              title:
                'Please indicate which methods were used in your research:',
              shortDescription: 'Methods',
              options: [
                {
                  __typename: 'FormElementOption',
                  id: '50ccff9e-f3e5-410b-b0b4-390f5474ba09',
                  label: 'Structural MRI',
                  labelColor: null,
                  value: 'Structural MRI',
                },
                {
                  __typename: 'FormElementOption',
                  id: 'dccc2374-ccc8-4ce1-9907-107445ba261a',
                  label: 'Functional MRI',
                  labelColor: null,
                  value: 'Functional MRI',
                },
                {
                  __typename: 'FormElementOption',
                  id: '0567acdf-5fb4-4fea-aae7-d2f0875792e9',
                  label: 'Diffusion MRI',
                  labelColor: null,
                  value: 'Diffusion MRI',
                },
                {
                  __typename: 'FormElementOption',
                  id: '0f8bdc88-4e87-46e6-bb59-bc2c53221494',
                  label: 'EEG/ERP',
                  labelColor: null,
                  value: 'EEG/ERP',
                },
                {
                  __typename: 'FormElementOption',
                  id: '8e10e2c7-b10e-4dd2-b0c5-74e6e87d3b1e',
                  label: 'Neurophysiology',
                  labelColor: null,
                  value: 'Neurophysiology',
                },
                {
                  __typename: 'FormElementOption',
                  id: '5822b3f8-80e6-47ee-bcdd-e17d1db47f7b',
                  label: 'PET',
                  labelColor: null,
                  value: 'PET',
                },
                {
                  __typename: 'FormElementOption',
                  id: 'd21a5be5-8a51-42f3-9e47-c15f8a4fc141',
                  label: 'MEG',
                  labelColor: null,
                  value: 'MEG',
                },
                {
                  __typename: 'FormElementOption',
                  id: '89a5e7de-df90-44bf-8971-5b49154331f6',
                  label: 'Optical Imaging',
                  labelColor: null,
                  value: 'Optical Imaging',
                },
                {
                  __typename: 'FormElementOption',
                  id: '22a428a7-bf65-49cd-9104-0122ae43f956',
                  label: 'Postmortem anatomy',
                  labelColor: null,
                  value: 'Postmortem anatomy',
                },
                {
                  __typename: 'FormElementOption',
                  id: '5b98a344-0438-4d79-85ab-9ae9f0e28d2d',
                  label: 'TMS',
                  labelColor: null,
                  value: 'TMS',
                },
                {
                  __typename: 'FormElementOption',
                  id: '5fbc6edd-e2e9-4dc2-a1a4-a6c67f6eef43',
                  label: 'Behavior',
                  labelColor: null,
                  value: 'Behavior',
                },
                {
                  __typename: 'FormElementOption',
                  id: '8cc52203-ca5b-4580-944f-748a62d449b5',
                  label: 'Neuropsychological testing',
                  labelColor: null,
                  value: 'Neuropsychological testing',
                },
                {
                  __typename: 'FormElementOption',
                  id: '86d5b15b-5377-4d93-855b-b30627161a76',
                  label: 'Computational modeling',
                  labelColor: null,
                  value: 'Computational modeling',
                },
              ],
            },
            {
              __typename: 'FormElement',
              id: '6bfdc237-814d-4af8-b0f0-064099d679ba',
              component: 'TextField',
              name: 'submission.otherMethods',
              title: 'If you used other research methods, please specify:',
              shortDescription: 'Other methods',
              options: null,
            },
            {
              __typename: 'FormElement',
              id: '38736c42-53bb-488d-a171-f6a102d7fa02',
              component: 'Select',
              name: 'submission.humanMRI',
              title: 'For human MRI, what field strength scanner do you use?',
              shortDescription: 'MRI strength',
              options: [
                {
                  __typename: 'FormElementOption',
                  id: '04c3be3e-4f34-4ace-87bb-58730b1d8f75',
                  label: '1T',
                  labelColor: null,
                  value: '1T',
                },
                {
                  __typename: 'FormElementOption',
                  id: '7cdb3256-aa80-48fa-a440-2bff62d5bbff',
                  label: '1.5T',
                  labelColor: null,
                  value: '1.5T',
                },
                {
                  __typename: 'FormElementOption',
                  id: '24edb964-56df-45a4-b78d-b12ca484795d',
                  label: '2T',
                  labelColor: null,
                  value: '2T',
                },
                {
                  __typename: 'FormElementOption',
                  id: '9b2c24fd-c778-4fb0-a100-d3c90ff21efb',
                  label: '3T',
                  labelColor: null,
                  value: '3T',
                },
                {
                  __typename: 'FormElementOption',
                  id: '42444841-aac8-4369-af6f-2c982332f3a9',
                  label: '4T',
                  labelColor: null,
                  value: '4T',
                },
                {
                  __typename: 'FormElementOption',
                  id: 'ae217273-dbcf-4966-a434-ffd25f7f0948',
                  label: '7T',
                  labelColor: null,
                  value: '7T',
                },
              ],
            },
            {
              __typename: 'FormElement',
              id: '88304f10-fbed-4597-9c25-0a4cdde7d7cf',
              component: 'TextField',
              name: 'submission.humanMRIother',
              title: 'If other, please specify:',
              shortDescription: 'Other MRI strength',
              options: null,
            },
            {
              __typename: 'FormElement',
              id: 'a2fc5de1-b173-42e6-839c-5082f62ba65d',
              component: 'CheckboxGroup',
              name: 'submission.packages',
              title: 'Which processing packages did you use for your study?',
              shortDescription: 'Processing packages',
              options: [
                {
                  __typename: 'FormElementOption',
                  id: '4e7f721b-a4eb-4dd6-a162-8db8a041d466',
                  label: 'AFNI',
                  labelColor: null,
                  value: 'AFNI',
                },
                {
                  __typename: 'FormElementOption',
                  id: 'c970e5be-2c86-452a-ad1f-aadb45c6c761',
                  label: 'SPM',
                  labelColor: null,
                  value: 'SPM',
                },
                {
                  __typename: 'FormElementOption',
                  id: '443bae43-64a2-478b-b48c-ba30463c1c43',
                  label: 'Brain Voyager',
                  labelColor: null,
                  value: 'Brain Voyager',
                },
                {
                  __typename: 'FormElementOption',
                  id: 'effedca5-4a53-4dca-a291-550ec222c915',
                  label: 'FSL',
                  labelColor: null,
                  value: 'FSL',
                },
                {
                  __typename: 'FormElementOption',
                  id: 'c9496435-230b-47ec-860f-446dcb718664',
                  label: 'Analyze',
                  labelColor: null,
                  value: 'Analyze',
                },
                {
                  __typename: 'FormElementOption',
                  id: '61e6f3cb-a34c-4d2a-9077-1b03b433226b',
                  label: 'Free Surfer',
                  labelColor: null,
                  value: 'Free Surfer',
                },
                {
                  __typename: 'FormElementOption',
                  id: '08ef7884-0255-4a5e-af84-9481712df018',
                  label: 'LONI Pipeline',
                  labelColor: null,
                  value: 'LONI Pipeline',
                },
              ],
            },
            {
              __typename: 'FormElement',
              id: '92988a50-40f1-43a6-833c-31702c232728',
              component: 'TextField',
              name: 'submission.otherPackages',
              title:
                'If you used any other processing packages, please list them here:',
              shortDescription: 'Other processing packages',
              options: null,
            },
            {
              __typename: 'FormElement',
              id: 'e8af0c63-e46f-46a8-bc90-5023fe50a541',
              component: 'AbstractEditor',
              name: 'submission.references',
              title: 'Provide references using author date format:',
              shortDescription: 'References',
              options: null,
            },
            {
              __typename: 'FormElement',
              id: '8b858adc-5f65-4385-9f79-5c5af1f67bd5',
              component: 'VisualAbstract',
              name: 'visualAbstract',
              title: 'Visual Abstract',
              shortDescription: null,
              options: null,
            },
            {
              __typename: 'FormElement',
              id: 'd80b2c88-6144-4003-b671-63990b9b2793',
              component: 'AbstractEditor',
              name: 'submission.abstract',
              title: 'Abstract',
              shortDescription: 'Abstract',
              options: null,
            },
          ],
        },
      },
    },
  },
  configuredColumnNames: [
    'shortId',
    'meta.title',
    'created',
    'updated',
    'status',
    'author',
  ],
  page: 1,
  sortDirection: 'DESC',
  sortName: 'created',
}

export default {
  title: 'Manuscripts/Collapse',
  component: Root,
}
