Reviews of a version of a project, as shown when making a decision.

```js
const reviews = [
  {
    id: faker.random.uuid(),
    note: {
      content: '<p>This is a review</p>',
      attachments: [
        {
          name: faker.system.commonFileName(),
          url: faker.internet.url()
        }
      ]
    },
    confidential: {
      content: '<p>This is confidential</p>',
    },
    events: {
      reviewed: faker.date.past(1)
    },
    recommendation: 'accept'
  },
  {
    id: faker.random.uuid(),
    note: {
      content: '<p>This is another review</p>',
    },
    events: {
      reviewed: faker.date.past(1)
    },
    recommendation: 'reject'
  }
];

<DecisionReviews
  version={{reviews}}/>
```
