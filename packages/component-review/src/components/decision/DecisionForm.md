A form for entering a decision on a version of a project.

```js
const { reduxForm } = require('redux-form');

const project = {
  id: faker.random.uuid(),
};

const version = {
  id: faker.random.uuid(),
  metadata: {
    keywords: ['foo', 'bar']
  }
};

const decision = {
  id: faker.random.uuid(),
  note: {
    content: '<p>This is a decision</p>'
  },
  recommendation: 'accept'
};

const ConnectedDecisionForm = reduxForm({ 
  form: 'decision',
  onSubmit: values => console.log(values),
  onChange: values => console.log(values)
})(DecisionForm);

<ConnectedDecisionForm
  version={version}
  initialValues={decision}
  uploadFile={() => new XMLHttpRequest()}/>
```
