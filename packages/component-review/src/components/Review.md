A form for entering a review of a version of a project.

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

const review = {
  id: faker.random.uuid(),
  note: '<p>This is a review</p>',
  recommendation: 'accept'
};

const journal = {
  recommendations: [
    {
      value: 'accept',
      label: 'Accept',
    },
    {
      value: 'revise',
      label: 'Revise',
    },
    {
      value: 'reject',
      label: 'Reject',
    }
  ]
}

const ReviewForm = reduxForm({ 
  form: 'review',
  onSubmit: values => console.log(values),
  onChange: values => console.log(values)
})(Review);

<ReviewForm
  version={version}
  journal={journal}
  initialValues={review}/>
```
