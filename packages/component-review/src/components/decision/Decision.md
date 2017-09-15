A decision on a version of a project.

```js
const decision = {
  id: faker.random.uuid(),
  note: {
    content: '<p>This is a decision</p>',
    attachments: [
      {
        name: faker.system.commonFileName(),
        url: faker.internet.url()
      }
    ]
  },
  recommendation: 'accept'
};

<Decision
  decision={decision}/>
```
