On the reviewers page, the handling editor can:

- Search users by entering a username or email address.
- Add a user as a reviewer of this version (which also adds them as a reviewer of the project, if not already present).
- View a list of reviewers of this version and perform actions on each reviewer.

```js
const { withFormik } = require('formik')
const { compose, withHandlers } = require('recompose')
const Reviewer = require('./Reviewer').default
const ReviewerForm = require('./ReviewerForm').default

const journal = {
  id: faker.random.uuid(),
  reviewers: [
    {
      id: faker.random.uuid(),
      user: faker.random.uuid(),
    },
  ],
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

const reviewers = [
  {
    status: 'invited',
    user: { id: 1, username: 'test user' },
  },
]

const reviewerUsers = [
  {
    id: faker.random.uuid(),
    email: faker.internet.email(),
    username: faker.internet.userName(),
  },
  {
    id: faker.random.uuid(),
    email: faker.internet.email(),
    username: faker.internet.userName(),
  },
  {
    id: faker.random.uuid(),
    email: faker.internet.email(),
    username: faker.internet.userName(),
  },
]

initialState = {
  reviewers,
}

const ReviewerFormContainer = compose(
  withFormik({
    form: 'reviewers',
    handleSubmit: ({ user }) => {
      setState({
        reviewers: state.reviewers.concat({
          id: faker.random.uuid(),
          reviewer: faker.random.uuid(),
          events: {
            invited: new Date().toISOString(),
          },
          _user: user,
          _reviewer: {
            ordinal: null,
          },
        }),
      })
    },
  }),
  withHandlers({
    loadOptions: props => input =>
      Promise.resolve({ options: props.reviewerUsers }),
  }),
)(ReviewerForm)

const ReviewerContainer = withHandlers({
  removeReviewer: props => () =>
    setState({
      reviewers: state.reviewers.filter(
        reviewer => reviewer.id !== props.reviewer.id,
      ),
    }),
})(Reviewer)
;<Reviewers
  ReviewerForm={ReviewerFormContainer}
  Reviewer={ReviewerContainer}
  journal={journal}
  manuscript={manuscript}
  reviewers={state.reviewers}
  reviewerUsers={reviewerUsers}
/>
```
