A list of questions that must be answered before submission. The questions are
configured via the journal config on the context.

```js
const forms = {
  children: [
    {
      title: faker.lorem.sentence(5),
      name: 'meta.declarations.openData',
    },
    {
      title: faker.lorem.sentence(5),
      name: 'meta.declarations.openPeerReview',
    },
    {
      title: faker.lorem.sentence(5),
      name: 'meta.declarations.previouslySubmitted',
    },
    {
      title: faker.lorem.sentence(5),
      name: 'meta.declarations.researchNexus',
    },
  ],
}

const manuscript = {
  id: faker.random.uuid(),
  meta: {
    title: faker.lorem.sentence(25),
    abstract: faker.lorem.sentence(100),
    articleType: 'original-research',
    declarations: {
      openData: 'yes',
      openPeerReview: 'no',
      preregistered: 'yes',
      previouslySubmitted: 'yes',
      researchNexus: 'no',
      streamlinedReview: 'no',
    },
  },
  suggestions: {
    reviewers: {
      opposed: faker.name.findName(),
    },
  },
  reviews: [
    {
      comments: { content: 'this needs review' },
      created: 'Thu Oct 11 2018',
      open: false,
      recommendation: '',
      user: { identities: [] },
    },
  ],
}
;<Declarations forms={forms} manuscript={manuscript} />
```
