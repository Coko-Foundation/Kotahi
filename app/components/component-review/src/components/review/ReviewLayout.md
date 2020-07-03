A page for a reviewer to submit a review of a version of a project.

```js
const { withFormik } = require('formik')

const journal = {
  id: faker.random.uuid(),
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
      recommendation: '',
      user: { id: 1 },
    },
  ],
})

const manuscript = Object.assign({}, manuscriptTemplate(), {
  manuscriptVersions: [manuscriptTemplate()],
})

const review = {
  comments: [{ content: 'this needs review' }],
  created: 'Thu Oct 11 2018',
  open: false,
  recommendation: '',
  user: { id: 1 },
}

const currentUser = {
  id: 1,
}

const ConnectedReviewLayout = withFormik({
  initialValues: {},
  mapPropsToValues: ({ manuscript, currentUser }) =>
    manuscript.reviews.find(review => review.user.id === currentUser.id),
  displayName: 'review',
  handleSubmit: (props, { props: { onSubmit, history } }) =>
    onSubmit(props, { history }),
})(ReviewLayout)
;<div style={{ position: 'relative', height: 600 }}>
  <ConnectedReviewLayout
    journal={journal}
    manuscript={manuscript}
    review={review}
    uploadFile={() => {}}
    currentUser={currentUser}
  />
</div>
```
