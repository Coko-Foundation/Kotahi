Project metadata, displayed at the top of the review form.

```js
const manuscriptTemplate = () => ({
  id: faker.random.uuid(),
  teams: [
    {
      id: faker.random.uuid(),
      role: 'reviewerEditor',
      name: 'Reviewer',
      object: {
        id: faker.random.uuid(),
        __typename: 'Manuscript',
      },
      objectType: 'manuscript',
      members: [
        {
          user: {
            id: 1,
            username: 'test user',
          },
          status: 'accepted',
        },
      ],
    },
  ],
  meta: {
    title: faker.lorem.sentence(25),
    abstract: faker.lorem.sentence(100),
    articleType: 'original-research',
    declarations: {
      openData: 'yes',
      openPeerReview: 'no',
      preregistered: 'yes',
      previouslySubmitted: 'yes',
      researchNexus: 'no',
      streamlinedReview: 'no',
    },
  },
  decision: {
    id: faker.random.uuid(),
    comments: [{ type: 'note', content: 'this needs review' }],
    created: 'Thu Oct 11 2018',
    open: false,
    status: '<p>This is a decision</p>',
    user: { id: 1 },
  },
  reviews: [
    {
      comments: [{ content: 'this needs review' }],
      created: 'Thu Oct 11 2018',
      open: false,
      recommendation: 'revise',
      user: { id: 1, username: 'test user' },
    },
  ],
})

const manuscript = Object.assign({}, manuscriptTemplate(), {
  manuscriptVersions: [manuscriptTemplate()],
})
;<ReviewMetadata manuscript={manuscript} />
```
