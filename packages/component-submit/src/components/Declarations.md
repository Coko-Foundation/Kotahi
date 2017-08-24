A list of questions that must be answered before submission.

```js
const { reduxForm } = require('redux-form');

const version = {
  declarations: {
    openData: 'yes'
  }
};

const journal = {
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
  }
};

const DeclarationsForm = reduxForm({ form: 'declarations' })(Declarations);

<DeclarationsForm
  initialValues={version}
  journal={journal}
  onChange={values => console.log(values)}/>
```
