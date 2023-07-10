import React from 'react'
import ReviewerTable from '../../app/components/component-dashboard/src/components/sections/ReviewerTable'
import { JournalProvider } from '../../app/components/xpub-journal/src'
import { XpubProvider } from '../../app/components/xpub-with-context/src'
import { ConfigProvider } from '../../app/components/config/src'
import * as journal from '../../config/journal'
import config from '../../config/sampleConfigFormData'
import DesignEmbed from '../common/utils'

const urlFrag = '/kotahi'

export const Base = args => (
  <XpubProvider>
    <JournalProvider journal={JSON.parse(JSON.stringify(journal))}>
      <ConfigProvider config={config}>
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
      </ConfigProvider>
    </JournalProvider>
  </XpubProvider>
)

export const Empty = Base.bind()

const currentUser = {
  __typename: 'User',
  id: '46d6cc04-6310-4021-be5a-5dcf4e24868c',
  username: 'Kotahi Dev',
  groupRoles: ['groupManager'],
  globalRoles: [],
}

const props = {
  currentUser,
  uriQueryParams: new URLSearchParams(),
  manuscriptsUserHasCurrentRoleIn: {
    __typename: 'PaginatedManuscripts',
    totalCount: 1,
    manuscripts: [
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
                  id: '46d6cc04-6310-4021-be5a-5dcf4e24868c',
                  username: 'Kotahi Dev',
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
    ],
  },
  submissionForm: {
    __typename: 'Form',
    structure: {
      __typename: 'FormStructure',
      children: [
        {
          __typename: 'FormElement',
          id: 'fa0c39ca-0486-4e29-ba24-f86f7d375c3f',
          component: 'Select',
          name: 'submission.objectType',
          title: 'Type of Research Object',
          shortDescription: null,
          validate: null,
          validateValue: null,
          doiValidation: null,
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
            {
              __typename: 'FormElementOption',
              id: '32121b38-b855-465e-b039-b5100177698b',
              label: 'Research article ',
              labelColor: null,
              value: 'Research article ',
            },
          ],
        },
        {
          __typename: 'FormElement',
          id: '47fd802f-ed30-460d-9617-c8a9b9025e95',
          component: 'TextField',
          name: 'meta.title',
          title: 'Title',
          shortDescription: null,
          validate: null,
          validateValue: null,
          doiValidation: null,
          options: null,
        },
        {
          __typename: 'FormElement',
          id: 'd76e5b3c-eeaa-4168-9318-95d43a31e3e4',
          component: 'AuthorsInput',
          name: 'submission.authorNames',
          title: 'Author names',
          shortDescription: null,
          validate: null,
          validateValue: null,
          doiValidation: null,
          options: null,
        },
        {
          __typename: 'FormElement',
          id: '62ca72ad-04b0-41fc-85d1-415469d7e895',
          component: 'CheckboxGroup',
          name: 'submission.topics',
          title: 'Topics',
          shortDescription: null,
          validate: null,
          validateValue: null,
          doiValidation: null,
          options: [
            {
              __typename: 'FormElementOption',
              id: '2323b6d1-8223-45e8-a0fc-1044a1e39d37',
              label: 'Neuropsychology ',
              labelColor: null,
              value: 'Neuropsychology ',
            },
            {
              __typename: 'FormElementOption',
              id: 'ac7cafca-c5c8-4940-9f2f-014d18660e90',
              label: 'Topic 2',
              labelColor: null,
              value: 'Topic 2',
            },
            {
              __typename: 'FormElementOption',
              id: '93c88240-9c2b-4c23-9301-23ed94ef61d7',
              label: 'Topic 3',
              labelColor: null,
              value: 'Topic 3',
            },
          ],
        },
        {
          __typename: 'FormElement',
          id: '1c2e9325-3fa8-41f3-8607-180eb8a25aa3',
          component: 'TextField',
          name: 'submission.DOI',
          title: 'DOI',
          shortDescription: null,
          validate: null,
          validateValue: null,
          doiValidation: 'true',
          options: null,
        },
        {
          __typename: 'FormElement',
          id: 'd80b2c88-6144-4003-b671-63990b9b2793',
          component: 'AbstractEditor',
          name: 'submission.abstract',
          title: 'Abstract',
          shortDescription: 'Abstract',
          validate: null,
          validateValue: null,
          doiValidation: null,
          options: null,
        },
        {
          __typename: 'FormElement',
          id: '7f5aa395-3486-4067-b636-ae204d472c16',
          component: 'TextField',
          name: 'submission.AuthorCorrespondence',
          title: 'Author correspondence ',
          shortDescription: null,
          validate: null,
          validateValue: null,
          doiValidation: null,
          options: null,
        },
        {
          __typename: 'FormElement',
          id: '347dc171-f008-45ac-8433-ca0711bf213c',
          component: 'AbstractEditor',
          name: 'submission.cover',
          title: 'Cover letter',
          shortDescription: null,
          validate: null,
          validateValue: null,
          doiValidation: null,
          options: null,
        },
        {
          __typename: 'FormElement',
          id: '14b8da7d-5924-4098-8d1f-e528c7c440b9',
          component: 'TextField',
          name: 'submission.EditorsEvaluation',
          title: 'Editors evaluation ',
          shortDescription: null,
          validate: null,
          validateValue: null,
          doiValidation: null,
          options: null,
        },
        {
          __typename: 'FormElement',
          id: 'bf2f9b4a-377b-4303-8f51-70d836eb1456',
          component: 'AbstractEditor',
          name: 'submission.datacode',
          title: 'Data and Code availability statements',
          shortDescription: null,
          validate: null,
          validateValue: null,
          doiValidation: null,
          options: null,
        },
        {
          __typename: 'FormElement',
          id: 'fa5e5b75-4b6f-4a2d-9113-c2b4db73ef8a',
          component: 'AbstractEditor',
          name: 'submission.competingInterests',
          title: 'Competing interests',
          shortDescription: null,
          validate: null,
          validateValue: null,
          doiValidation: null,
          options: null,
        },
        {
          __typename: 'FormElement',
          id: '6bfdc237-814d-4af8-b0f0-064099d679ba',
          component: 'TextField',
          name: 'submission.Funding',
          title: 'Funding',
          shortDescription: null,
          validate: null,
          validateValue: null,
          doiValidation: null,
          options: null,
        },
        {
          __typename: 'FormElement',
          id: 'b769b4d5-f9b3-48d3-a6d5-77bb6a9e95b0',
          component: 'SupplementaryFiles',
          name: 'fileName',
          title: 'Upload supplementary materials',
          shortDescription: null,
          validate: null,
          validateValue: null,
          doiValidation: null,
          options: null,
        },
        {
          __typename: 'FormElement',
          id: 'b127ecb1-4862-4662-a958-3266eb284353',
          component: 'TextField',
          name: 'submission.authorContributions',
          title: 'Author contributions ',
          shortDescription: null,
          validate: null,
          validateValue: null,
          doiValidation: null,
          options: null,
        },
        {
          __typename: 'FormElement',
          id: '6342cff7-c57a-4fd9-b91d-c4cf77b4c309',
          component: 'AbstractEditor',
          name: 'submission.DecisionLetter',
          title: 'Decision letter and author response',
          shortDescription: null,
          validate: null,
          validateValue: null,
          doiValidation: null,
          options: null,
        },
        {
          __typename: 'FormElement',
          id: 'e8af0c63-e46f-46a8-bc90-5023fe50a541',
          component: 'AbstractEditor',
          name: 'submission.references',
          title: 'References ',
          shortDescription: null,
          validate: null,
          validateValue: null,
          doiValidation: null,
          options: null,
        },
        {
          __typename: 'FormElement',
          id: 'ebe75cec-0ba8-4f00-9024-20e77ed94f1c',
          component: 'AuthorsInput',
          name: 'submission.reviewingEditor',
          title: 'Reviewing editors name ',
          shortDescription: null,
          validate: null,
          validateValue: null,
          doiValidation: null,
          options: null,
        },
        {
          __typename: 'FormElement',
          id: '6871680a-2278-40b3-80c6-7de06f21aafb',
          component: 'TextField',
          name: 'submission.copyrightHolder',
          title: 'Copyright holder',
          shortDescription: null,
          validate: null,
          validateValue: null,
          doiValidation: null,
          options: null,
        },
        {
          __typename: 'FormElement',
          id: '1e9ff636-f850-4d20-b079-36af49fa4ad1',
          component: 'TextField',
          name: 'submission.copyrightStatement',
          title: 'Copyright statement ',
          shortDescription: null,
          validate: null,
          validateValue: null,
          doiValidation: null,
          options: null,
        },
        {
          __typename: 'FormElement',
          id: '7617c919-4413-4306-b709-ef78c3110c3f',
          component: 'TextField',
          name: 'submission.copyrightYear',
          title: 'Copyright year ',
          shortDescription: null,
          validate: null,
          validateValue: null,
          doiValidation: null,
          options: null,
        },
        {
          __typename: 'FormElement',
          id: '6deaacc6-759a-4a68-b494-c38c664bb665',
          component: 'TextField',
          name: 'submission.dateReceived',
          title: 'Date received ',
          shortDescription: null,
          validate: null,
          validateValue: null,
          doiValidation: null,
          options: null,
        },
        {
          __typename: 'FormElement',
          id: '8b858adc-5f65-4385-9f79-5c5af1f67bd5',
          component: 'TextField',
          name: 'submission.dateAccepted',
          title: 'Date accepted',
          shortDescription: null,
          validate: null,
          validateValue: null,
          doiValidation: null,
          options: null,
        },
        {
          __typename: 'FormElement',
          id: 'f6e46890-4b96-4c90-ab48-b4fc5abb9b40',
          component: 'TextField',
          name: 'submission.datePublished',
          title: 'Date published ',
          shortDescription: null,
          validate: null,
          validateValue: null,
          doiValidation: null,
          options: null,
        },
        {
          __typename: 'FormElement',
          id: '66469976-314f-4949-b2ff-702039b262c0',
          component: 'ManuscriptFile',
          name: 'manuscriptFile',
          title: 'Manuscript File',
          shortDescription: null,
          validate: null,
          validateValue: null,
          doiValidation: null,
          options: null,
        },
      ],
    },
  },
  urlFrag,
  updateReviewerStatus: () => {},
  reviewerRespond: () => {},
}

Base.args = props

Empty.args = {
  ...Base.args,
  manuscriptsUserHasCurrentRoleIn: {
    __typename: 'PaginatedManuscripts',
    totalCount: 0,
    manuscripts: [],
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
