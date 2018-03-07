A suggested author, with a list of authored papers.

```js
const author = {
  id: faker.random.uuid(),
  name: faker.name.findName(),
  papers: [
    {
      id: faker.random.uuid(),
      title: faker.lorem.sentence(20, 5),
      scorePercent: faker.random.number({ min: 1, max: 100 })
    },
    {
      id: faker.random.uuid(),
      title: faker.lorem.sentence(20, 5),
      scorePercent: faker.random.number({ min: 1, max: 100 })
    },
    {
      id: faker.random.uuid(),
      title: faker.lorem.sentence(20, 5),
      scorePercent: faker.random.number({ min: 1, max: 100 })
    }
  ]
};

<Author author={author}/>
```
