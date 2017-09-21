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

initialState = {
  reviewer: {
    status: 'invited'
  }
};

<ReviewerItem
      project={project}
      version={version}
      reviewer={state.reviewer}
      reviewerResponse={(id, status) => setState({ reviewer: { status }})}/>
```

When the reviewer has accepted the invitation to review, a link to perform their review is displayed.

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

initialState = {
  reviewer: {
    status: 'accepted'
  }
};

<ReviewerItem
      project={project}
      version={version}
      reviewer={state.reviewer}/>
```
