A form for inviting a reviewer to a version of a project.

```js
const { reduxForm } = require('redux-form');

const reviewerUsers = [
  {
    id: faker.random.uuid(),
    email: faker.internet.email(),
    username: faker.internet.userName()
  },
  {
    id: faker.random.uuid(),
    email: faker.internet.email(),
    username: faker.internet.userName()
  },
  {
    id: faker.random.uuid(),
    email: faker.internet.email(),
    username: faker.internet.userName()
  }
];

const loadOptions = input => {    
  // TODO: filter users
  
  return Promise.resolve({ options: reviewerUsers })
};

const ConnectedReviewerForm = reduxForm({ 
  form: 'reviewer',
  onSubmit: values => console.log(values)
})(ReviewerForm);

<ConnectedReviewerForm
  loadOptions={loadOptions}/>
```
