A login form.

```js
const { reduxForm } = require('redux-form');

const LoginForm = reduxForm({ form: 'login' })(Login);

<LoginForm 
  onSubmit={values => console.log(values)}/>
```

An error is displayed at the top of the form.

```js
const { reduxForm } = require('redux-form');

const LoginForm = reduxForm({ form: 'login-error' })(Login);

<LoginForm 
      loginError="There was an error"
      onSubmit={values => console.log(values)}/>
```

