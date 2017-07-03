export default [
  {
    id: 'project-1',
    status: 'imported',
    statusDate: '2017-06-01T12:00:00Z',
    title: 'An imported project',
    roles: {
      owner: {
        'user-1': {
          user: {
            id: 'user-1',
            username: 'admin'
          }
        }
      }
    }
  },
  {
    id: 'project-2',
    status: 'submitted',
    statusDate: '2017-06-29T12:00:00Z',
    title: 'A submitted project',
    roles: {
      owner: {
        'user-1': {
          user: {
            id: 'user-1',
            username: 'admin'
          }
        }
      }
    }
  }
]
