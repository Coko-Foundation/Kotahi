A dashboard section listing projects that the current user is an owner of.

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

<OwnerSection
      projects={projects}
      deleteProject={() => {}}
      projectRoute={project => 'foo'}/>
```
