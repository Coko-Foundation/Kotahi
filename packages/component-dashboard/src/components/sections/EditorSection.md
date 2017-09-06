A dashboard section listing projects that the current user is handling as editor.

```js
const projects = [
  {
    id: faker.random.uuid(),
    title: faker.lorem.sentence(15),
    fragments: [
      faker.random.uuid()
    ]
  },
   {
      id: faker.random.uuid(),
      title: faker.lorem.sentence(25),
      fragments: [
        faker.random.uuid()
      ]
    }
];

<EditorSection
      projects={projects}
      projectRoute={project => 'foo'}
      addUserToTeam={props => console.log(props)}/>
```
