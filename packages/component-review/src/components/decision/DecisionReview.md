Reviews of a version of a project, as shown when making a decision.

```js
const review = {
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
   recommendation: 'accept'
 };

const reviewer = {
  ordinal: faker.random.number({ min: 1, max: 5}),
  name: faker.name.findName()
};


<DecisionReview
  review={review}
  reviewer={reviewer}/>
```

The review is hidden by default, but can be toggled to display the review.

```js
const review = {
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
   recommendation: 'revise'
 };

const reviewer = {
  ordinal: faker.random.number({ min: 1, max: 5}),
  name: faker.name.findName()
};


<DecisionReview
  review={review}
  reviewer={reviewer}
  open/>
```
