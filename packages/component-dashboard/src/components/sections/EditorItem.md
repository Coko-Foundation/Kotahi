A dashboard item showing a project that the current user is handling as editor.

```js
const project = {
  id: faker.random.uuid(),
  title: faker.lorem.sentence(15),
  status: 'submitted',
  fragments: [
    faker.random.uuid()
  ],
  owners: [
    {
      name: faker.name.findName()
    }
  ],
  reviewers: [
    {
      id: 'reviewer-invited',
      name: faker.name.findName(),
    },
    {
      id: 'reviewer-accepted',
      name: faker.name.findName(),
    },
    {
      id: 'reviewer-declined',
      name: faker.name.findName(),
    },
    {
      id: 'reviewer-removed',
      name: faker.name.findName(),
    },
    {
      id: 'reviewer-reviewed',
      name: faker.name.findName(),
      ordinal: 1
    }
  ]
};

const version = {
  id: faker.random.uuid(),
  submitted: faker.date.past(1),
  metadata: {
    articleType: 'original-research',
    articleSection: ['cognitive-psychology']
  },
  declarations: {
    openReview: true
  },
  reviews: [
    {
      reviewer: 'reviewer-invited',
      status: 'invited',
      events: {
        invited: faker.date.past(1),
      }
    },
    {
      reviewer: 'reviewer-accepted',
      status: 'accepted',
      events: {
        invited: faker.date.past(1),
        accepted: faker.date.past(1),
      }
    },
    {
      reviewer: 'reviewer-declined',
      status: 'declined',
      events: {
        invited: faker.date.past(1),
        declined: faker.date.past(1),
      }
    },
    {
      reviewer: 'reviewer-reviewed',
      status: 'reviewed',
      events: {
        invited: faker.date.past(1),
        accepted: faker.date.past(1),
        reviewed: faker.date.past(1),
      }
    },
  ]
};

<EditorItem
      project={project}
      version={version}
      addUserToTeam={props => console.log(props)}/>
```
