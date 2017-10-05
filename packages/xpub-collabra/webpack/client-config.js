const path = require('path')
const config = require('config')
const fs = require('fs-extra')
const { pick } = require('lodash')

const outputPath = path.resolve(__dirname, '../_build/client.json')

const fields = [
  'authsome',
  'validations',
  'pubsweet-client',
]

fs.outputJsonSync(outputPath, pick(config, fields))

module.exports = outputPath
