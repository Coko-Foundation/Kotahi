A form field that displays the results of validation.

```js
const { reduxForm } = require('redux-form');

const ValidatedFieldForm = reduxForm({ 
  form: 'validated-field-error',
  onChange: values => console.log(values)
})(ValidatedField);

<ValidatedFieldForm 
    name="error" 
    validate={() => 'Required'}
    component={input => <TextField {...input}/>}
    />
```

```js
const { reduxForm } = require('redux-form');

const ValidatedFieldForm = reduxForm({ 
  form: 'validated-field-warning',
  onChange: values => console.log(values)
})(ValidatedField);

<ValidatedFieldForm 
    name="warning" 
    warn={() => 'Expected'}
    component={input => <TextField {...input}/>}
    />
```
