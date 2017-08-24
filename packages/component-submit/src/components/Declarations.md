A list of questions that must be answered before submission.

```js
const { reduxForm } = require('redux-form');

const version = {
  declarations: {
    openData: 'yes'
  }
};

const DeclarationsForm = reduxForm({ form: 'declarations' })(Declarations);

<DeclarationsForm
  initialValues={version}
  onChange={values => console.log(values)}/>
```
