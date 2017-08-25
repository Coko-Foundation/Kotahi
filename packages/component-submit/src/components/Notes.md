A form for entering the submission's metadata.

```js
const { reduxForm } = require('redux-form');

const version = {
  notes: {
    fundingAcknowledgement: faker.lorem.sentence(25),
  }
};

const NotesForm = reduxForm({ form: 'notes' })(Notes);

<NotesForm 
  initialValues={version} 
  onChange={values => console.log(values)}/>
```
