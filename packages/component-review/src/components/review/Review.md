A review of a version of a project.

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

<Review
  review={review}/>
```
