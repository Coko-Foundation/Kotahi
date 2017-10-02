On the reviewers page, the handling editor can:

* Search users by entering a username or email address.
* Add a user as a reviewer of this version (which also adds them as a reviewer of the project, if not already present).
* View a list of reviewers of this version and perform actions on each reviewer.

```js
const { reduxForm } = require('redux-form');
const { compose, withHandlers } = require('recompose');
const Reviewer = require('./Reviewer').default;
const ReviewerForm = require('./ReviewerForm').default;

const project = {
  id: faker.random.uuid(),
  reviewers: [
    {
      id: faker.random.uuid(),
      user: faker.random.uuid(),
    }
  ]
};

const version = {
  id: faker.random.uuid()
};

const reviewers = [
  {
    id: faker.random.uuid(),
    reviewer: faker.random.uuid(),
    events: {
      invited: faker.date.recent(),
    },
    status: 'invited',
    _user: {
       id: faker.random.uuid(),
       username: faker.internet.userName(),
    },
    _projectReviewer: {
      ordinal: null
    }
  },
];

const reviewerUsers = [
  {
    id: faker.random.uuid(),
    username: faker.internet.userName(),
    email: faker.internet.email()
  },
  {
    id: faker.random.uuid(),
    username: faker.internet.userName(),
    email: faker.internet.email()
  }
];

initialState = {
  reviewers
};

const ReviewerFormContainer = compose(
  reduxForm({ 
    form: 'reviewers',
    onSubmit: reset => ({ user }) => {
      setState({ 
        reviewers: state.reviewers.concat({
          id: faker.random.uuid(),
          reviewer: faker.random.uuid(),
          events: {
            invited: (new Date()).toISOString(),
          },
          _user: user,
          _projectReviewer: {
            ordinal: null
          }
        }) 
      })
      
      // reset()
    }
  }),
  withHandlers({
    loadOptions: props => input => Promise.resolve({ options: props.reviewerUsers })
  })
)(ReviewerForm);

const ReviewerContainer = withHandlers({
  removeReviewer: props => () => setState({ 
    reviewers: state.reviewers
      .filter(reviewer => reviewer.id !== props.reviewer.id) 
  })
})(Reviewer);

<Reviewers
  ReviewerForm={ReviewerFormContainer}
  Reviewer={ReviewerContainer}
  project={project}
  version={version}
  reviewers={state.reviewers}
  reviewerUsers={reviewerUsers}
/>
```
