import React from 'react'
import ReviewerTable from '../../app/components/component-dashboard/src/components/sections/ReviewerTable'

import { JournalProvider } from '../../app/components/xpub-journal/src'
import { XpubProvider } from '../../app/components/xpub-with-context/src'
import * as journal from '../../config/journal'
import DesignEmbed from '../common/utils'

const urlFrag = '/kotahi'

export const Base = args => (
  <XpubProvider>
    <JournalProvider journal={JSON.parse(JSON.stringify(journal))}>
      <>
        {args.figmaEmbedLink && (
          <>
            <h2 style={{ color: '#333333' }}>Design</h2>
            <iframe
              allowFullScreen
              height={350}
              src={args.figmaEmbedLink}
              style={{ border: '1px solid rgba(0, 0, 0, 0.1)' }}
              title="figma embed"
              width="100%"
            />
            <h2 style={{ color: '#333333' }}>Component</h2>
          </>
        )}
        <ReviewerTable {...args} />
      </>
    </JournalProvider>
  </XpubProvider>
)

export const Empty = Base.bind()

const reviewerLatestVersions = [
  {
    manuscriptVersions: [],
    id: 'd75dd479-8658-418a-91b6-4bee523d25b1',
    shortId: 7,
    teams: [
      {
        id: '24392be5-4c42-4bc2-a5f2-05637f09ac5c',
        role: 'author',
        name: 'Author',
        members: [
          {
            id: 'f6dd51e9-3591-4748-84c1-26bfa6450426',
            user: {
              id: '7a66eada-055f-4179-a420-e7534323202f',
              username: 'Coloredcow',
              __typename: 'User',
            },
            status: null,
            __typename: 'TeamMember',
          },
        ],
        __typename: 'Team',
      },
      {
        id: '72c6cd72-107e-4078-b8fd-41e5bfeff15b',
        role: 'seniorEditor',
        name: 'Senior Editor',
        members: [
          {
            id: '7dd3e0f8-1bb0-4c13-9e48-a9706a58a5bd',
            user: {
              id: '1fe868b5-da3a-4d19-958f-2e73eb753ffd',
              username: 'Pankaj Kandpal',
              __typename: 'User',
            },
            status: null,
            __typename: 'TeamMember',
          },
        ],
        __typename: 'Team',
      },
      {
        id: '9d27fcea-be8f-40e2-8cf6-33da2ce1be80',
        role: 'handlingEditor',
        name: 'Handling Editor',
        members: [
          {
            id: '5f04ba12-a754-4618-a91e-09330c439aae',
            user: {
              id: '1fe868b5-da3a-4d19-958f-2e73eb753ffd',
              username: 'Pankaj Kandpal',
              __typename: 'User',
            },
            status: null,
            __typename: 'TeamMember',
          },
        ],
        __typename: 'Team',
      },
      {
        id: '93d2c87e-e534-44cd-abdb-b2a5ed49b375',
        role: 'editor',
        name: 'Editor',
        members: [
          {
            id: 'de78bc03-3efe-47a6-a99b-635fcd3940b5',
            user: {
              id: '1fe868b5-da3a-4d19-958f-2e73eb753ffd',
              username: 'Pankaj Kandpal',
              __typename: 'User',
            },
            status: null,
            __typename: 'TeamMember',
          },
        ],
        __typename: 'Team',
      },
      {
        id: '8ad9c0a3-663a-404c-aca9-321d3c22d526',
        role: 'reviewer',
        name: 'Reviewers',
        members: [
          {
            id: '0390e8f9-9537-43f2-85cc-4693f0b22ebe',
            user: {
              id: '1fe868b5-da3a-4d19-958f-2e73eb753ffd',
              username: 'Pankaj Kandpal',
              __typename: 'User',
            },
            status: 'invited',
            __typename: 'TeamMember',
          },
          {
            id: 'e017086e-e6d6-4cbc-8a19-b62a458e178e',
            user: {
              id: '7a66eada-055f-4179-a420-e7534323202f',
              username: 'Coloredcow',
              __typename: 'User',
            },
            status: 'invited',
            __typename: 'TeamMember',
          },
          {
            id: 'a4a4aa09-6287-4582-9de4-11f976f63a52',
            user: {
              id: '7b4f2f1e-56bb-4dd4-a616-b6c06d047b0c',
              username: 'PK',
              __typename: 'User',
            },
            status: 'invited',
            __typename: 'TeamMember',
          },
        ],
        __typename: 'Team',
      },
    ],
    status: 'accepted',
    meta: {
      manuscriptId: 'd75dd479-8658-418a-91b6-4bee523d25b1',
      title: 'New submission 06/04/2022, 18:01:21',
      history: null,
      __typename: 'ManuscriptMeta',
    },
    submission:
      '{"DOI":"","cover":"","title":"","topics":[],"Funding":"","abstract":"","datacode":"","objectType":"software","references":"","authorNames":"","dateAccepted":"","dateReceived":"","copyrightYear":"","datePublished":"","DecisionLetter":"","copyrightHolder":"","reviewingEditor":"","EditorsEvaluation":"","competingInterests":"","copyrightStatement":"","authorContributions":"","AuthorCorrespondence":""}',
    published: '2022-04-08T07:58:54.517Z',
    __typename: 'Manuscript',
  },
]

const currentUser = {
  __typename: 'User',
  id: '46d6cc04-6310-4021-be5a-5dcf4e24868c',
  username: 'Kotahi Dev',
  admin: true,
}

const props = {
  query: {
    data: {
      manuscriptsUserHasCurrentRoleIn: { manuscripts: reviewerLatestVersions },
      currentUser,
    },
    loading: false,
    error: null,
  },
  urlFrag,
  updateReviewerStatus: () => {},
  reviewerRespond: () => {},
}

Base.args = props

Empty.args = {
  ...Base.args,
  query: {
    ...Base.args.query,
    data: {
      ...Base.args.query.data,
      manuscriptsUserHasCurrentRoleIn: { manuscripts: [] },
    },
  },
  figmaEmbedLink:
    'https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Ffile%2FuDxsjgDWxjiof0qSNFLelr%2FKotahi-storybook%3Fnode-id%3D1385%253A11',
}

export default {
  title: 'Dashboard/ReviewerTable',
  component: ReviewerTable,
  parameters: {
    docs: {
      page: () => (
        <DesignEmbed figmaEmbedLink="https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Ffile%2FuDxsjgDWxjiof0qSNFLelr%2FKotahi-storybook%3Fnode-id%3D1385%253A2" />
      ),
    },
  },
  argTypes: {},
}
