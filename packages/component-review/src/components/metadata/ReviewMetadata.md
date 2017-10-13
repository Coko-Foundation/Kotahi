Project metadata, displayed at the top of the review form.

```js
const { reduxForm } = require('redux-form');

const project = {
  id: faker.random.uuid(),
};

const version = {
  id: faker.random.uuid(),
  metadata: {
    keywords: ['foo', 'bar']
  },
  declarations: {
    openReview: true
  },
  files: {
    supplementary: [
      {
        name: faker.system.commonFileName(),
        url: 'https://example.com/'
      }
    ]
  }
};

const handlingEditors = [
  {
    username: faker.internet.userName(),
  }
];

<ReviewMetadata
  version={version}
  handlingEditors={handlingEditors}/>
```
