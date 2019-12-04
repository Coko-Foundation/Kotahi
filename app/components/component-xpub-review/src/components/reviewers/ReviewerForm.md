A form for inviting a reviewer to a version of a project.

```js
const { withFormik } = require('formik')

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

const loadOptions = input => {
  // TODO: filter users

  return Promise.resolve({ options: reviewerUsers })
}

const ConnectedReviewerForm = withFormik({
  initialValues: {},
  mapPropsToValues: ({ manuscript }) => manuscript,
  displayName: 'reviewers',
  handleSubmit: () => {},
})(ReviewerForm)
;<ConnectedReviewerForm
  loadOptions={loadOptions}
  form={{ values: { teams: [] } }}
/>
```
