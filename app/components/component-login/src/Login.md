A login form

```js
const { withFormik } = require('formik')

const LoginForm = withFormik({
  initialValues: {
    username: '',
    password: '',
  },
  mapPropsToValues: props => ({
    username: props.username,
    password: props.password,
  }),
  displayName: 'login',
  handleSubmit: val => console.log(val),
})(Login)
;<LoginForm />
```

Which can have an error message:

```js
const { withFormik } = require('formik')

const LoginForm = withFormik({
  initialValues: {
    username: '',
    password: '',
  },
  mapPropsToValues: props => ({
    username: props.username,
    password: props.password,
  }),
  displayName: 'login',
  handleSubmit: (values, { setErrors }) =>
    setErrors('Wrong username or password.'),
})(Login)
;<LoginForm />
```
