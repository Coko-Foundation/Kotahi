A form for entering the submission's metadata.

```js
const { reduxForm } = require('redux-form');

const version = {
  metadata: {
      title: faker.lorem.sentence(25),
      articleType: 'original-research'
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
  articleSections: [
     {
       value: 'organizational-behavior',
       label: 'Organizational Behavior'
     },
     {
       value: 'methodology',
       label: 'Methodology and Research Practice'
     },
  ]
};

const MetadataForm = reduxForm({ form: 'metadata' })(Metadata);

<MetadataForm 
  initialValues={version} 
  journal={journal}
  onChange={values => console.log(values)}/>
```
