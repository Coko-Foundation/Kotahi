const fs = require('fs')
const path = require('path')

const rootPackageJson = require('../package.json')
const clientPackageJson = require('../packages/client/package.json')
const serverPackageJson = require('../packages/server/package.json')

const oldVersion = rootPackageJson.version
const [oldMajor, oldMinor, oldPatch] = oldVersion.split('.')

const validValues = [
  `${parseInt(oldMajor, 10) + 1}.0.0`,
  `${oldMajor}.${parseInt(oldMinor, 10) + 1}.0`,
  `${oldMajor}.${oldMinor}.${parseInt(oldPatch, 10) + 1}`,
]

const newVersion = process.env.VERSION?.trim()

if (!newVersion) {
  throw new Error(
    `Cannot update package.json versions: Variable "VERSION" needs to be set.`,
  )
}

if (!validValues.includes(newVersion)) {
  throw new Error(
    `Cannot update package.json versions: Invalid new version value. Given the current value of ${oldVersion}, valid values are: ${validValues.join(
      ', ',
    )}`,
  )
}

const files = [
  {
    data: rootPackageJson,
    path: path.join(__dirname, '..', 'package.json'),
  },
  {
    data: clientPackageJson,
    path: path.join(__dirname, '..', 'packages', 'client', 'package.json'),
  },
  {
    data: serverPackageJson,
    path: path.join(__dirname, '..', 'packages', 'server', 'package.json'),
  },
]

files.forEach(item => {
  /* eslint-disable no-param-reassign */
  item.data.version = newVersion

  fs.writeFile(item.path, `${JSON.stringify(item.data, null, 2)}\n`, err => {
    if (err) {
      throw new Error(`Could not write to ${item.path}: ${err}`)
    }

    /* eslint-disable-next-line no-console */
    console.log(`Updated version on ${item.path} to ${newVersion}`)
  })
})
