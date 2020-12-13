const { commitizen } = require('@coko/lint')

commitizen.scopes = ['api', 'models', 'client', 'ui', '*']

module.exports = commitizen
