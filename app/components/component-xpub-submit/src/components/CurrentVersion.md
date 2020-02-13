A form for entering information about the submission.

```js
const journal = {
  id: faker.random.uuid(),
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
;<div style={{ position: 'relative', paddingRight: 100 }}>
  <CurrentVersion forms={forms} manuscript={manuscript} journal={journal} />
</div>
```
