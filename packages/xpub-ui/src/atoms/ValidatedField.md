A form field that displays the results of validation.

```js
const { reduxForm } = require('redux-form');

const ValidatedFieldForm = reduxForm({ 
  form: 'validated-field-error',
  onChange: values => console.log(values)
})(ValidatedField);

const TextInput = input => <TextField {...input}/>;

<ValidatedFieldForm 
    name="error" 
    validate={() => 'Required'}
    component={TextInput}/>
```

```js
const { reduxForm } = require('redux-form');

const ValidatedFieldForm = reduxForm({ 
  form: 'validated-field-warning',
  onChange: values => console.log(values)
})(ValidatedField);

const TextInput = input => <TextField {...input}/>;

<ValidatedFieldForm 
    name="warning" 
    warn={() => 'Expected'}
    component={TextInput}/>
```
