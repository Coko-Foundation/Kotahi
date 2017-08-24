A form for entering the submission's metadata.

```js
const { reduxForm } = require('redux-form');

const version = {
  title: faker.lorem.sentence(25),
  articleType: 'original-research'
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
    ]
};

const MetadataForm = reduxForm({ form: 'login' })(Metadata);

<MetadataForm 
  version={version} 
  journal={journal}
  onSubmit={values => console.log(values)}/>
```
