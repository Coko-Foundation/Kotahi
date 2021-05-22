// // const { execSync } = require('child_process')
const { readFileSync } = require('fs')
const path = require('path')

const seed = require('./clearAndSeed')

const dumpFile = name =>
  path.join(__dirname, '..', 'cypress', 'dumps', `${name}.sql`)

seed(readFileSync(dumpFile(process.argv[2]), 'utf-8'))
