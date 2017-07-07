export default {
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
    },
    reviewer: {
      'user-baz': {
        user: {
          id: 'user-baz',
          username: 'baz',
          name: 'Baz Baz'
        }
      },
      'user-qubit': {
        user: {
          id: 'user-qubit',
          username: 'qubit',
          name: 'Qubit Qubit'
        }
      }
    }
  },
  declarations: {
    human: false,
    newTaxon: false,
    financialDisclosure: 'There were no financial conflicts'
  },
  events: [
    {
      id: 'event-1',
      type: 'created',
      date: '2017-06-01T12:00:00Z',
      user: {
        id: 'user-foo',
        username: 'foo' // TODO: populate this later?
      }
    },
    {
      id: 'event-2',
      type: 'title:update',
      date: '2017-06-01T13:00:00Z',
      user: {
        id: 'user-foo',
        username: 'foo'
      },
      changes: {
        title: {
          from: 'The old title',
          to: 'The new title'
        }
      }
    }
  ]
}
