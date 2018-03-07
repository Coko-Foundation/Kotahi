```js
const version = {
  id: faker.random.uuid(),
  metadata: {
    title: faker.lorem.sentence(20, 5),
    abstract: faker.lorem.sentences(5),
    authors: [
      faker.name.findName(),
      faker.name.findName(),
      faker.name.findName(),
    ]
  }
};

<Metadata version={version} />
```
