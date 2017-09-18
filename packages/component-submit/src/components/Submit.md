A form for entering the submission's metadata.

```js
const { reduxForm } = require('redux-form');

const project = {
  id: faker.random.uuid(),
};

const version = {
  id: faker.random.uuid(),
  metadata: {
      title: faker.lorem.sentence(25),
      articleType: 'original-research'
  },
  declarations: {
    openData: 'yes'
  },
  suggestions: {
    reviewers: {
      opposed: [
        faker.name.findName()
      ]
    }
  }
};

const SubmitForm = reduxForm({ 
  form: 'submit',
  touchOnChange: true,
  onSubmit: values => console.log(values),
  onChange: values => console.log(values)
})(Submit);

<div style={{position:'relative', paddingRight: 100}}>
    <SubmitForm 
      project={project}
      version={version}
      initialValues={version}/>
</div>
```
