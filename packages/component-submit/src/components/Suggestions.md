A list of questions that must be answered before submission.

```js
const { reduxForm } = require('redux-form');

const version = {
  suggestions: {
    reviewers: {
      opposed: [
        faker.name.findName()
      ]
    }
  }
};


const SuggestionsForm = reduxForm({ form: 'suggestions' })(Suggestions);

<SuggestionsForm
  initialValues={version}
  onChange={values => console.log(values)}/>
```
