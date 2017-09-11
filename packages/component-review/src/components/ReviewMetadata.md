A form for entering a review of a version of a project.

```js
const { reduxForm } = require('redux-form');

const project = {
  id: faker.random.uuid(),
};

const version = {
  id: faker.random.uuid(),
  metadata: {
    keywords: ['foo', 'bar']
  }
};

<ReviewMetadata
  version={version}/>
```
