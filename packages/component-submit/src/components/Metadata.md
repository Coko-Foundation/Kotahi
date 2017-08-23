A form for entering the submission's metadata.

```js
const { reduxForm } = require('redux-form');

const version = {
  title: faker.lorem.sentence(25)
};

const MetadataForm = reduxForm({ form: 'login' })(Metadata);

<MetadataForm 
  version={version} 
  onSubmit={values => console.log(values)}/>
```
