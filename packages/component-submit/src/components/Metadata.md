A form for entering the submission's metadata.

```js
const { reduxForm } = require('redux-form');

const version = {
  metadata: {
      title: faker.lorem.sentence(25),
      articleType: 'original-research'
  }
};

const MetadataForm = reduxForm({ form: 'metadata' })(Metadata);

<MetadataForm 
  initialValues={version} 
  onChange={values => console.log(values)}/>
```
