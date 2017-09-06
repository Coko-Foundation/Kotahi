A dashboard item showing a project that the current user is a reviewer of.

```js
const project = {
  id: faker.random.uuid(),
  title: faker.lorem.sentence(15),
  fragments: [
    faker.random.uuid()
  ],
};

const version = {
  id: faker.random.uuid(),
};

<ReviewerItem
      project={project}
      version={version}
      deleteProject={props => console.log(props)}/>
```
