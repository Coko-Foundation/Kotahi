A list of questions that must be answered before submission. The questions are
configured via the journal config on the context.

```js
const { reduxForm } = require('redux-form')
const DeclarationsForm = reduxForm({ form: 'declarations' })(Declarations)

;<DeclarationsForm onChange={values => console.log(values)} />
```
