A dashboard section listing projects that the current user is handling as editor.

```js
const projects = [
  {
    id: faker.random.uuid(),
    title: faker.lorem.sentence(15),
    fragments: [
      faker.random.uuid()
    ],
    _owner: {
      name: faker.name.findName()
    },
    _fragments: [
      {
          submitted: faker.date.past(2),
          metadata: {
            articleSection: ['foo', 'bar']
          },
          declarations: {
            openReview: true
          }
      }
    ],
    _teams: [
      {
        teamType: 'senior-editor',
        teamName: 'Senior Editor',
        members: [3]
      }
    ]
  },
  {
    id: faker.random.uuid(),
    title: faker.lorem.sentence(25),
    fragments: [
      faker.random.uuid()
    ],
    _owner: {
      name: faker.name.findName()
    },
    _fragments: [
      {
          submitted: faker.date.past(1),
          metadata: {
            articleSection: ['foo']
          },
          declarations: {
            openReview: false
          }
      }
    ],
    _teams: [
      {
        teamType: 'senior-editor',
        teamName: 'Senior Editor',
        members: [3]
      }
    ]
  }
];

const journal = {
  editors: {
      managing: [
        {
          user: 1,
          name: "Managing Editor One"
        },
        {
          user: 2,
          name: "Managing Editor Two"
        }
      ],
      senior: [
        {
          user: 3,
          name: "Senior Editor One"
        },
        {
          user: 4,
          name: "Senior Editor Two"
        }
      ],
      handling: [
        {
          user: 5,
          name: "Handling Editor One"
        },
        {
          user: 6,
          name: "Handling Editor Two"
        }
      ]
    }
};

<EditorSection
      journal={journal}
      projects={projects}
      projectRoute={project => 'foo'}
      addUserToTeam={props => console.log(props)}/>
```
