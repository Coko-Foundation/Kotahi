A form for entering the submission's supplementary material.

```js
const { reduxForm } = require('redux-form');

const file = () => ({
  name: faker.system.commonFileName(),
  type: faker.system.commonFileType(),
  size: faker.random.number(),
});

const version = {
  files: [
    file(),
    file(),
    file()
  ]
};

const SupplementaryFilesForm = reduxForm({ form: 'supplementaryFiles' })(SupplementaryFiles);

<SupplementaryFilesForm 
  initialValues={version} 
  uploadFile={file => new XMLHttpRequest()}
  onChange={values => console.log(values)}/>
```
