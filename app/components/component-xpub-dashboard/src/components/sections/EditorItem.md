A dashboard item showing a project that the current user is handling as editor.

```js
const { JournalProvider } = require('xpub-journal')
const { MockedProvider } = require('@apollo/react-testing')
const journal = require('@pubsweet/styleguide/config/journal')
const queries = require('../../graphql/queries')
const gql = require('graphql-tag')

const mocks = [
  {
    request: {
      query: gql`
        query CurrentUser {
          currentUser {
            admin
            id
            username
          }
        }
      `,
    },
    result: {
      data: {
        currentUser: { id: faker.random.uuid(), username: 'test', admin: true },
      },
    },
  },
]

const journals = {
  id: faker.random.uuid(),
  title: faker.lorem.sentence(15),
  fragments: [faker.random.uuid()],
}

const version = {
  id: faker.random.uuid(),
  status: 'submitted',
  meta: {
    title: faker.lorem.sentence(10),
    articleType: 'original-research',
    articleSection: ['cognitive-psychology'],
    declarations: {
      streamlinedReview: 'yes',
      openPeerReview: 'yes',
    },
  },
  reviews: [
    {
      id: faker.random.uuid(),
      user: {},
    },
  ],
}
;<JournalProvider journal={journal}>
  <EditorItem journals={journals} version={version} />
</JournalProvider>
```
