A form for entering a decision on a version of a project.

```js
const { withFormik } = require('formik')

const manuscript = {
  id: faker.random.uuid(),
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
    comments: { type: 'note', content: 'this needs review' },
    created: 'Thu Oct 11 2018',
    open: false,
    recommendation: '<p>This is a decision</p>',
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
}

const ConnectedDecisionForm = withFormik({
  initialValues: {},
  mapPropsToValues: ({ manuscript }) => manuscript,
  displayName: 'decision',
  handleSubmit: (props, { props: { onSubmit, history } }) =>
    onSubmit(props, { history }),
})(DecisionForm)
;<ConnectedDecisionForm
  manuscript={manuscript}
  uploadFile={() => new XMLHttpRequest()}
/>
```
