Reviews of a version of a project, as shown when making a decision.

```js
const version = {
  id: faker.random.uuid(),
  submitted: faker.date.past(2),
  declarations: {
    openReview: true
  },
  files: {
    supplementary: []
  },
  reviewers: [
    {
      id: faker.random.uuid(),
      reviewer: 'reviewer-reviewed',
      status: 'reviewed',
      submitted: faker.date.past(2),
      note: {
        content: '<p>This is a review</p>'
      },
      recommendation: 'accept'
    },
    {
      id: faker.random.uuid(),
      reviewer: 'reviewer-reviewed',
      status: 'reviewed',
      submitted: faker.date.past(2),
      note: {
        content: '<p>This is another review</p>'
      },
      recommendation: 'revise'
    },
  ],
  decision: {
    submitted: faker.date.past(2),
    note: {
      content: '<p>This is a decision</p>',
      recommendation: 'accept'
    }
  }
};

<DecisionReviews
  version={version}/>
```
