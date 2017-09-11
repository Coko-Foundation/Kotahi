A review of a version of a project.

```js
const review = {
  id: faker.random.uuid(),
  note: '<p>This is a review</p>',
  confidential: '<p>This is confidential</p>',
  recommendation: 'accept'
};

<Review
  review={review}
  initialValues={review}/>
```
