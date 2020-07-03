A page for an editor to make a decision on a version of a project.

```js
const { withFormik } = require('formik')
const { JournalProvider } = require('xpub-journal')
const AssignEditor = require('../assignEditors/AssignEditor').default

const journal = {
  id: faker.random.uuid(),
}

const manuscriptTemplate = () => ({
  id: faker.random.uuid(),
  teams: [
    {
      id: faker.random.uuid(),
      role: 'author',
      name: 'Authors',
      object: {
        id: faker.random.uuid(),
        __typename: 'Manuscript',
      },
      objectType: 'manuscript',
      members: [
        {
          user: {},
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
    user: { identities: [] },
  },
  reviews: [
    {
      comments: { content: 'this needs review' },
      created: 'Thu Oct 11 2018',
      open: false,
      recommendation: '',
      user: { identities: [] },
    },
  ],
})

const manuscript = Object.assign({}, manuscriptTemplate(), {
  manuscriptVersions: [manuscriptTemplate()],
})

const team = {
  members: [],
}

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

const AssignEditorContainer = ({
  project,
  teamName,
  teamTypeName,
  addUserToTeam,
}) => (
  <AssignEditor
    team={team}
    options={options}
    manuscript={manuscript}
    teamName={teamName}
    teamTypeName={teamTypeName}
    addUserToTeam={addUserToTeam}
  />
)

const ConnectedDecisionLayout = withFormik({
  initialValues: {},
  mapPropsToValues: ({ manuscript }) => manuscript,
  displayName: 'decision',
  handleSubmit: (props, { props: { onSubmit, history } }) =>
    onSubmit(props, { history }),
})(DecisionLayout)
;<div style={{ position: 'relative', height: 600 }}>
  <JournalProvider journal={journal}>
    <ConnectedDecisionLayout manuscript={manuscript} uploadFile={() => {}} />
  </JournalProvider>
</div>
```
