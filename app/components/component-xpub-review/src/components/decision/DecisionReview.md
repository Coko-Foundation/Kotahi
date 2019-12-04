Reviews of a version of a project, as shown when making a decision.

```js
const review = {
  comments: [{ content: 'this needs review' }],
  created: 'Thu Oct 11 2018',
  open: false,
  recommendation: 'revise',
  user: { id: 1, username: 'test user' },
}

const reviewer = {
  ordinal: faker.random.number({ min: 1, max: 5 }),
  name: faker.name.findName(),
}
;<DecisionReview open review={review} reviewer={{ name: 'test user' }} />
```

The review is hidden by default, but can be toggled to display the review.

```js
const review = {
  comments: [{ content: 'this needs review' }],
  created: 'Thu Oct 11 2018',
  open: false,
  recommendation: 'revise',
  user: { id: 1, username: 'test user' },
}

const reviewer = {
  ordinal: faker.random.number({ min: 1, max: 5 }),
  name: faker.name.findName(),
}
;<DecisionReview review={review} reviewer={{ name: 'test user' }} />
```
