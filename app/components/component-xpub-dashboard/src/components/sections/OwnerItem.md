A dashboard item showing a project that the current user is an owner of.

```js
const journal = require('@pubsweet/styleguide/config/journal')

const journals = {
  id: faker.random.uuid(),
  title: faker.lorem.sentence(15),
  manuscripts: [faker.random.uuid()],
}

const version = {
  id: faker.random.uuid(),
  meta: {
    title: faker.lorem.sentence(10),
  },
}
;<OwnerItem
  journals={journals}
  version={version}
  deleteManuscript={props => console.log(props)}
/>
```
