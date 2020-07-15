A form for entering the submission's metadata.

```js
const manuscript = {
  meta: {
    title: faker.lorem.sentence(25),
    abstract: faker.lorem.sentence(50),
    articleType: 'original-research',
    keywords: 'test, test1',
  },
}
;<MetadataFields manuscript={manuscript} />
```
