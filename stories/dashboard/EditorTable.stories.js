import React from 'react'
import EditorTable from '../../app/components/component-dashboard/src/components/sections/EditorTable'
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
        <EditorTable {...args} />
      </>
    </JournalProvider>
  </XpubProvider>
)

export const Empty = Base.bind()

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
  query: {
    data: {
      manuscriptsUserHasCurrentRoleIn: { manuscripts: editorLatestVersions },
      currentUser,
    },
    loading: false,
    error: null,
  },
  urlFrag,
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
  title: 'Dashboard/EditorTable',
  component: EditorTable,
  parameters: {
    docs: {
      page: () => (
        <DesignEmbed figmaEmbedLink="https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Ffile%2FuDxsjgDWxjiof0qSNFLelr%2FKotahi-storybook%3Fnode-id%3D1385%253A2" />
      ),
    },
  },
  argTypes: {},
}
