export default [
  {
    id: 'project-imported',
    status: 'imported',
    statusDate: '2017-06-01T12:00:00Z',
    title: 'An imported project',
    roles: {
      owner: {
        'user-foo': {
          user: {
            id: 'user-foo',
            username: 'foo'
          }
        }
      }
    }
  },
  {
    id: 'project-submitted',
    status: 'submitted',
    statusDate: '2017-06-29T12:00:00Z',
    title: 'A submitted project',
    roles: {
      owner: {
        'user-foo': {
          user: {
            id: 'user-foo',
            username: 'foo'
          }
        }
      },
      editor: {
        'user-bar': {
          user: {
            id: 'user-bar',
            username: 'bar',
            name: 'Bar Bar'
          }
        }
      }
    },
    declarations: {

    }
  }
]
