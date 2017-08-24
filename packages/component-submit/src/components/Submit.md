A form for entering the submission's metadata.

```js
const { reduxForm } = require('redux-form');

const project = {
  id: faker.random.uuid(),
};

const version = {
  id: faker.random.uuid(),
  metadata: {
      title: faker.lorem.sentence(25),
      articleType: 'original-research'
  },
  declarations: {
    openData: 'yes'
  }
};

const journal = {
  articleTypes: [
    {
      value: 'original-research',
      label: 'Original Research Report'
    },
    {
      value: 'review',
      label: 'Review'
    },
    {
      value: 'opinion',
      label: 'Opinion/Commentary'
    },
    {
      value: 'registered-report',
      label: 'Registered Report'
    },
  ],
  declarations: {
    questions: [
      {
        id: 'openData',
        legend: 'Data is open'
      },
      {
        id: 'previouslySubmitted',
        legend: 'Previously submitted'
      },
      {
        id: 'openPeerReview',
        legend: 'Open peer review'
      }
    ]
  },
  suggestions: {
    reviewers: {
      opposed: [
        { name: faker.name.findName() }
      ]
    }
  }
};

const SubmitForm = reduxForm({ form: 'submit' })(Submit);

<SubmitForm 
  project={project}
  initialValues={version} 
  journal={journal}
  onChange={values => console.log(values)}
  onSubmit={values => console.log(values)}/>
```
