A dashboard section listing projects that the current user is a reviewer of.

```js
const projects = [
  {
    id: faker.random.uuid(),
    title: faker.lorem.sentence(15)
  },
  {
    id: faker.random.uuid(),
    title: faker.lorem.sentence(25)
  }
];

<ReviewerSection
      projects={projects}
      reviewerResponse={() => {}}
      projectRoute={project => 'foo'}/>
```
