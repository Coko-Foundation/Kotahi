module.exports = {
  user: {
    type: 'user',
    username: 'testuser',
    email: 'test@example.com',
    password: 'test',
  },

  updatedUser: {
    username: 'changeduser',
    email: 'changed@example.com',
    password: 'changed',
  },

  otherUser: {
    type: 'user',
    username: 'anotheruser',
    email: 'another@example.com',
    password: 'rubgy',
  },

  localIdentity: {
    name: 'Someone',
    aff: 'University of PubSweet',
    type: 'local',
  },

  externalIdentity: {
    type: 'external',
    identifier: 'orcid',
    oauth: {
      accessToken: 'someAccessToken',
      refreshToken: 'someRefreshToken',
    },
  },
}
