import React from 'react'
import ThreadedDiscussion from '../../app/components/component-formbuilder/src/components/builderComponents/ThreadedDiscussion'
import DesignEmbed from '../common/utils'

export const Base = args => (
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
    <ThreadedDiscussion {...args} />
  </>
)

Base.args = {
  isValid: true,
  isSubmitting: true,
  createdAt: '2022-04-27',
  updatedAt: '2022-04-28',
  channelId: '8542101c-fc13-4d3f-881f-67243beaf83a',
  comments: [
    {
      id: 123,
      value:
        '<p>lLorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur',
      author: {
        __typename: 'User',
        id: '20ca2a8d-d78e-4260-baed-86369992353f',
        username: 'Kotahi Author',
        profilePicture: null,
        online: null,
      },
      createdAt: '2022-04-27 12:12:12',
      updatedAt: '2022-04-28 00:00:00',
      userCanEditOwnComment: false,
      userCanEditAnyComment: false,
    },
    {
      id: 124,
      value:
        '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur</p>',
      author: {
        __typename: 'User',
        id: '20ca2a8d-d78e-4260-baed-86369992353f',
        username: 'Kotahi Author',
        profilePicture: null,
        online: null,
      },
      createdAt: '2022-04-27 00:00:00',
      updatedAt: '2022-04-28 00:00:00',
      userCanEditOwnComment: false,
      userCanEditAnyComment: false,
    },
    {
      id: 125,
      value:
        '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur</p>',
      author: {
        __typename: 'User',
        id: '20ca2a8d-d78e-4260-baed-86369992353f',
        username: 'Kotahi Author',
        profilePicture: null,
        online: null,
      },
      createdAt: '2022-04-27 00:00:00',
      updatedAt: '2022-04-28 00:00:00',
      userCanEditOwnComment: false,
      userCanEditAnyComment: false,
    },
  ],
  autoFocus: true,
  placeholder: 'Add your feedback here',
  user: {
    __typename: 'User',
    id: '20ca2a8d-d78e-4260-baed-86369992353f',
    username: 'Kotahi Author',
    profilePicture: null,
    online: null,
  },
}

export default {
  title: 'Threaded Discussion/ThreadedDiscussion',
  component: ThreadedDiscussion,
  parameters: {
    docs: {
      page: () => (
        <DesignEmbed figmaEmbedLink="https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Ffile%2FuDxsjgDWxjiof0qSNFLelr%2FKotahi-storybook%3Fnode-id%3D1%253A115" />
      ),
    },
  },
}
