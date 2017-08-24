A list of questions that must be answered before submission.

```js
const { reduxForm } = require('redux-form');

const version = {
  
};

const DeclarationsForm = reduxForm({ form: 'declarations' })(Declarations);

<DeclarationsForm
  version={version}
  submitVersion={data => console.log(data)}/>
```
