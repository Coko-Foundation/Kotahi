// // const { execSync } = require('child_process')
const { readFileSync } = require('fs')
const path = require('path')

const { applyDump } = require('./resetDb')

const dumpFile = name =>
  path.join(__dirname, '..', 'cypress', 'dumps', `${name}.sql`)

applyDump(readFileSync(dumpFile(process.argv[2]), 'utf-8'), process.argv[2])
