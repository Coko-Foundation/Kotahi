const Authsome = require('authsome')

const authsomeConfig = require('config').get('authsome')

const collections = [
  {
    id: 'collection1',
    fragments: ['fragment1'],
  },
  {
    id: 'collection2',
    fragments: [],
  },
]

const teams = [
  {
    id: 'team1',
    role: 'handlingEditor',
    object: {
      id: 'collection2',
      type: 'collection',
    },
  },
  {
    id: 'team2',
    role: 'seniorEditor',
    object: {
      id: 'collection1',
      type: 'collection',
    },
  },
  {
    id: 'team3',
    role: 'managingEditor',
    object: {
      id: 'collection1',
      type: 'collection',
    },
  },
  {
    id: 'team4',
    role: 'reviewer',
    object: {
      id: 'fragment1',
      type: 'fragment',
    },
  },
  {
    id: 'team5',
    role: 'managingEditor',
    object: {
      id: 'collection2',
      type: 'collection',
    },
  },
]

const users = [
  {
    id: 'user1',
    username: 'handlingEditor1',
    teams: ['team1'],
  },
  {
    id: 'user2',
    username: 'seniorEditor1',
    teams: ['team2'],
  },
  {
    id: 'user3',
    username: 'managingEditor1',
    teams: ['team3', 'team5'],
  },
  {
    id: 'user4',
    username: 'reviewerEditor1',
    teams: ['team4'],
  },
  {
    id: 'adminId',
    username: 'admin',
    admin: true,
  },
]

const authsome = new Authsome(
  { ...authsomeConfig, mode: require('../../config/authsome.js') },
  {
    models: {
      User: { find: id => users.find(user => user.id === id) },
      Team: { find: id => teams.find(team => team.id === id) },
    },
  },
)

describe('admin', () => {
  it('allows everything to an admin', async () => {
    const permission = await authsome.can(
      'adminId',
      'DELETE',
      'thisSensitiveThing',
    )
    expect(permission).toBe(true)
  })
})

describe('Handling Editor', () => {
  it('lists only collections where user is a member of the handling editors team', async () => {
    const permission = await authsome.can('user1', 'GET', {
      path: '/collections',
    })

    const filteredCollections = await permission.filter(collections)

    expect(filteredCollections).toEqual([collections[1]])
  })
})

describe('Reviewer Editor', () => {
  it('lists only collections where user is a member of the reviewer editors team', async () => {
    const permission = await authsome.can('user4', 'GET', {
      path: '/collections',
    })

    const filteredCollections = await permission.filter(collections)

    expect(filteredCollections).toEqual([collections[0]])
  })
})

describe('Senior Editor', () => {
  it('lists only collections where user is a member of the senior editors team', async () => {
    const permission = await authsome.can('user2', 'GET', {
      path: '/collections',
    })
    const filteredCollections = await permission.filter(collections)
    expect(filteredCollections).toEqual([collections[0]])
  })
})

describe('Managing Editor', () => {
  it('can list all collections', async () => {
    const permission = await authsome.can('user3', 'GET', {
      path: '/collections',
    })
    const filteredCollections = await permission.filter(collections)

    expect(filteredCollections).toEqual(collections)
  })
})
