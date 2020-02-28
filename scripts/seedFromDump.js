const seed = require('./clearAndSeed')

// // const { execSync } = require('child_process')
const path = require('path')
const { readFileSync } = require('fs')

const dumpFile = name =>
  path.join(__dirname, '..', 'cypress', 'dumps', `${name}.sql`)

seed(readFileSync(dumpFile(process.argv[2]), 'utf-8'))
