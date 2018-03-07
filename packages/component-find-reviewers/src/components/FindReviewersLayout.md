A page showing submission metadata and a list of suggested reviewers and similar papers.

```js
const papers = [
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

const authors = [
  {
    id: faker.random.uuid(),
    name: faker.name.findName(),
    papers: papers.slice(0, 2)
  },
  {
    id: faker.random.uuid(),
    name: faker.name.findName(),
    papers: papers.slice(0, 1)
  },
  {
    id: faker.random.uuid(),
    name: faker.name.findName(),
    papers: papers.slice(1, 2)
  }
];

const version = {
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

<FindReviewersLayout 
  authors={authors}
  papers={papers}
  version={version}
  error={null}
/>
```
