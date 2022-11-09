import React from 'react'
import Dashboard from '../../app/components/component-dashboard/src/components/Dashboard'
import { JournalProvider } from '../../app/components/xpub-journal/src'
import { XpubProvider } from '../../app/components/xpub-with-context/src'
import * as journal from '../../config/journal'
import DesignEmbed from '../common/utils'

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
        <Dashboard {...args} />
      </>
    </JournalProvider>
  </XpubProvider>
)

export const EmptySubmission = Base.bind()
export const EmptyReviews = Base.bind()
export const EmptyEditor = Base.bind()

const authorLatestVersions = [
  {
    id: '96482a0a-c149-4675-bc94-87ada45f04e8',
    shortId: 5,
    created: '2022-03-26T09:18:40.212Z',
    files: [],
    reviews: [],
    teams: [
      {
        id: '7360c7d6-7db0-4144-8516-c9b815e65519',
        role: 'author',
        members: [
          {
            id: 'ebea4e00-afb2-4dd7-8439-202f1d7c9947',
            user: {
              id: '1fe868b5-da3a-4d19-958f-2e73eb753ffd',
              username: 'Kotahi Dev',
              __typename: 'User',
            },
            __typename: 'TeamMember',
          },
        ],
        __typename: 'Team',
      },
    ],
    decision: null,
    status: 'submitted',
    meta: {
      manuscriptId: '96482a0a-c149-4675-bc94-87ada45f04e8',
      title: 'New submission 26/03/2022, 14:48:39',
      source: null,
      abstract: null,
      history: null,
      __typename: 'ManuscriptMeta',
    },
    authors: null,
    submission:
      '{"DOI":"","cover":"","title":"","topics":[],"Funding":"","abstract":"","datacode":"","objectType":"","references":"","authorNames":"","dateAccepted":"","dateReceived":"","copyrightYear":"","datePublished":"","DecisionLetter":"","copyrightHolder":"","reviewingEditor":"","EditorsEvaluation":"","competingInterests":"","copyrightStatement":"","authorContributions":"","AuthorCorrespondence":""}',
    __typename: 'Manuscript',
  },
  {
    id: 'd75dd479-8658-418a-91b6-4bee523d25b1',
    shortId: 7,
    created: '2022-04-06T12:31:21.767Z',
    files: [],
    reviews: [
      {
        id: 'f6a31884-ffa2-4ebf-81f4-5df10d417f12',
        created: '2022-04-07T12:31:42.209Z',
        updated: '2022-04-08T07:57:52.198Z',
        decisionComment: {
          id: '4e31142e-935b-46a1-bf84-b39ea3ae0c2c',
          commentType: 'decision',
          content: '<p class="paragraph">Approved</p>',
          files: [],
          __typename: 'ReviewComment',
        },
        reviewComment: null,
        confidentialComment: null,
        isDecision: true,
        isHiddenFromAuthor: null,
        isHiddenReviewerName: null,
        canBePublishedPublicly: null,
        recommendation: 'accepted',
        user: {
          id: '1fe868b5-da3a-4d19-958f-2e73eb753ffd',
          username: 'Kotahi Dev',
          profilePicture: '/profiles/Kotahi Dev.png',
          defaultIdentity: {
            id: '413bd6a7-dcb2-4724-9bb7-f26952b40008',
            identifier: '0000-0002-1203-5003',
            __typename: 'Identity',
          },
          __typename: 'User',
        },
        __typename: 'Review',
      },
    ],
    decision: '',
    teams: [
      {
        id: '24392be5-4c42-4bc2-a5f2-05637f09ac5c',
        name: 'Author',
        role: 'author',
        manuscript: {
          id: 'd75dd479-8658-418a-91b6-4bee523d25b1',
          __typename: 'Manuscript',
        },
        members: [
          {
            id: 'f6dd51e9-3591-4748-84c1-26bfa6450426',
            user: {
              id: '1fe868b5-da3a-4d19-958f-2e73eb753ffd',
              username: 'Kotahi Dev',
              defaultIdentity: {
                id: '37042af9-a364-4a41-8d2c-cf072dea33a9',
                name: 'Kotahi Dev ',
                __typename: 'Identity',
              },
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
        name: 'Senior Editor',
        role: 'seniorEditor',
        manuscript: {
          id: 'd75dd479-8658-418a-91b6-4bee523d25b1',
          __typename: 'Manuscript',
        },
        members: [
          {
            id: 'de5e425c-cc20-4489-9809-19be5e0b8165',
            user: {
              id: '1fe868b5-da3a-4d19-958f-2e73eb753ffd',
              username: 'Kotahi Dev',
              defaultIdentity: {
                id: '413bd6a7-dcb2-4724-9bb7-f26952b40008',
                name: 'Kotahi Dev',
                __typename: 'Identity',
              },
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
        name: 'Handling Editor',
        role: 'handlingEditor',
        manuscript: {
          id: 'd75dd479-8658-418a-91b6-4bee523d25b1',
          __typename: 'Manuscript',
        },
        members: [
          {
            id: 'f836d546-8405-45cc-8568-f836ffe85bcb',
            user: {
              id: '1fe868b5-da3a-4d19-958f-2e73eb753ffd',
              username: 'Kotahi Dev',
              defaultIdentity: {
                id: '413bd6a7-dcb2-4724-9bb7-f26952b40008',
                name: 'Kotahi Dev',
                __typename: 'Identity',
              },
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
        name: 'Editor',
        role: 'editor',
        manuscript: {
          id: 'd75dd479-8658-418a-91b6-4bee523d25b1',
          __typename: 'Manuscript',
        },
        members: [
          {
            id: '165817d2-9b95-4213-905d-3d213950202e',
            user: {
              id: '1fe868b5-da3a-4d19-958f-2e73eb753ffd',
              username: 'Kotahi Dev',
              defaultIdentity: {
                id: '413bd6a7-dcb2-4724-9bb7-f26952b40008',
                name: 'Kotahi Dev',
                __typename: 'Identity',
              },
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
        name: 'Reviewers',
        role: 'reviewer',
        manuscript: {
          id: 'd75dd479-8658-418a-91b6-4bee523d25b1',
          __typename: 'Manuscript',
        },
        members: [
          {
            id: 'e017086e-e6d6-4cbc-8a19-b62a458e178e',
            user: {
              id: '1fe868b5-da3a-4d19-958f-2e73eb753ffd',
              username: 'Kotahi Dev',
              defaultIdentity: {
                id: '37042af9-a364-4a41-8d2c-cf072dea33a9',
                name: 'Kotahi Dev ',
                __typename: 'Identity',
              },
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
      source: null,
      abstract: null,
      history: null,
      __typename: 'ManuscriptMeta',
    },
    submission:
      '{"DOI":"","cover":"","title":"","topics":[],"Funding":"","abstract":"","datacode":"","objectType":"software","references":"","authorNames":"","dateAccepted":"","dateReceived":"","copyrightYear":"","datePublished":"","DecisionLetter":"","copyrightHolder":"","reviewingEditor":"","EditorsEvaluation":"","competingInterests":"","copyrightStatement":"","authorContributions":"","AuthorCorrespondence":""}',
    published: '2022-04-08T07:58:54.517Z',
    manuscriptVersions: [],
    channels: [
      {
        id: '413d5e21-22d3-4329-8dd5-a4d877c6fc0e',
        type: 'all',
        topic: 'Manuscript discussion',
        __typename: 'Channel',
      },
      {
        id: '746fc9ea-1d80-454b-9a83-9ec39d7a5959',
        type: 'editorial',
        topic: 'Editorial discussion',
        __typename: 'Channel',
      },
    ],
    __typename: 'Manuscript',
  },
]

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

const editorLatestVersions = [
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
              id: '46d6cc04-6310-4021-be5a-5dcf4e24868c',
              username: 'Kotahi Dev',
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
            id: '8a53b57d-9d58-4634-a569-78ee1b92872e',
            user: {
              id: '46d6cc04-6310-4021-be5a-5dcf4e24868c',
              username: 'Kotahi Dev',
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
            id: '71102811-4578-430a-8a5d-d98823182003',
            user: {
              id: '46d6cc04-6310-4021-be5a-5dcf4e24868c',
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
            id: 'e70563f9-250e-4dc4-ac7b-184573fdef92',
            user: {
              id: '46d6cc04-6310-4021-be5a-5dcf4e24868c',
              username: 'Pankaj Kandpal',
              __typename: 'User',
            },
            status: null,
            __typename: 'TeamMember',
          },
        ],
        __typename: 'Team',
      },
    ],
    status: 'new',
    meta: {
      manuscriptId: 'd75dd479-8658-418a-91b6-4bee523d25b1',
      title: 'New submission 06/04/2022, 18:01:21',
      history: null,
      __typename: 'ManuscriptMeta',
    },
    submission:
      '{"DOI":"","cover":"","title":"","topics":[],"Funding":"","abstract":"","datacode":"","objectType":"software","references":"","authorNames":"","dateAccepted":"","dateReceived":"","copyrightYear":"","datePublished":"","DecisionLetter":"","copyrightHolder":"","reviewingEditor":"","EditorsEvaluation":"","competingInterests":"","copyrightStatement":"","authorContributions":"","AuthorCorrespondence":""}',
    published: null,
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
  instanceName: 'aperture',
  authorLatestVersions,
  reviewerLatestVersions,
  currentUser,
  editorLatestVersions,
  shouldShowShortId: true,
  prettyRoleText: value => value.join(' '),
  // eslint-disable-next-line no-alert
  newSubmission: () => alert('Add new submission...'),
  // eslint-disable-next-line no-alert
  reviewerRespond: () => alert('Responding as reviewer...'),
}

Base.args = props

EmptySubmission.args = {
  ...Base.args,
  authorLatestVersions: [],
  figmaEmbedLink:
    'https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Ffile%2FuDxsjgDWxjiof0qSNFLelr%2FKotahi-storybook%3Fnode-id%3D1385%253A5',
}

EmptyReviews.args = {
  ...Base.args,
  reviewerLatestVersions: [],
  figmaEmbedLink:
    'https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Ffile%2FuDxsjgDWxjiof0qSNFLelr%2FKotahi-storybook%3Fnode-id%3D1385%253A9',
}

EmptyEditor.args = {
  ...Base.args,
  editorLatestVersions: [],
  figmaEmbedLink:
    'https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Ffile%2FuDxsjgDWxjiof0qSNFLelr%2FKotahi-storybook%3Fnode-id%3D1385%253A11',
}

export default {
  title: 'Dashboard/Dashboard',
  component: Dashboard,
  parameters: {
    docs: {
      page: () => (
        <DesignEmbed figmaEmbedLink="https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Ffile%2FuDxsjgDWxjiof0qSNFLelr%2FKotahi-storybook%3Fnode-id%3D1385%253A2" />
      ),
    },
  },
  argTypes: {},
}
