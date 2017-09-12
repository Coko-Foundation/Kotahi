A list of files attached to a review or decision.

```js
const attachments = [
  {
    filename: faker.system.commonFileName(),
    url: faker.internet.url()
  },
  {
    filename: faker.system.commonFileName(),
    url: faker.internet.url()
  }
];

<Attachments attachments={attachments}/>
```
