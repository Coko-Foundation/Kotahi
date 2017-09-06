A dashboard item showing a project that the current user is handling as editor.

```js
const project = {
  id: faker.random.uuid(),
  title: faker.lorem.sentence(15),
  fragments: [
    faker.random.uuid()
  ],
  owners: [
    {
      name: faker.name.findName()
    }
  ]
};

const version = {
  id: faker.random.uuid(),
  metadata: {
    articleSection: ['cognitive-psychology']
  },
  declarations: {
    openReview: true
  }
};

<EditorItem
      project={project}
      version={version}
      addUserToTeam={props => console.log(props)}/>
```
