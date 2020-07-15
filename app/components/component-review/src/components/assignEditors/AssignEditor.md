A drop-down menu for assigning an editor to a project.

```js
const { JournalProvider } = require('xpub-journal')
const journal = require('@pubsweet/styleguide/config/journal')

const project = {
  id: faker.random.uuid(),
}

const team = {
  members: [],
}

const manuscriptTemplate = () => ({
  id: faker.random.uuid(),
  teams: [
    {
      id: faker.random.uuid(),
      role: 'reviewerEditor',
      name: 'reviewer',
      object: {
        id: faker.random.uuid(),
        __typename: 'Manuscript',
      },
      objectType: 'manuscript',
      members: [
        {
          user: { id: 1 },
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

const manuscript = Object.assign({}, manuscriptTemplate())

const options = [
  {
    value: faker.random.uuid(),
    label: faker.internet.userName(),
  },
  {
    value: faker.random.uuid(),
    label: faker.internet.userName(),
  },
  {
    value: faker.random.uuid(),
    label: faker.internet.userName(),
  },
]
;<JournalProvider journal={journal}>
  <AssignEditor
    manuscript={manuscript}
    team={team}
    teamName="Senior Editor"
    teamTypeName="seniorEditor"
    options={options}
    addUserToTeam={value => console.log(value)}
  />
</JournalProvider>
```
