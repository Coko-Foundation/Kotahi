A signup form.

```js
const { reduxForm } = require('redux-form');

const SignupForm = reduxForm({ form: 'signup' })(Signup);

<SignupForm 
      onSubmit={values => console.log(values)}/>
```

An error is displayed at the top of the form.

```js

const { reduxForm } = require('redux-form');

const SignupForm = reduxForm({ form: 'signup-error' })(Signup);

<SignupForm 
      signupError="There was an error"
      onSubmit={values => console.log(values)}/>
```

