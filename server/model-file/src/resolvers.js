const crypto = require('crypto')
const { promisify } = require('util')
const fs = require('fs-extra')
const path = require('path')
const config = require('config')

const File = require('./file')

const randomBytes = promisify(crypto.randomBytes)
const uploadsPath = config.get('pubsweet-server').uploads

const upload = async file => {
  const { stream, filename, encoding } = await file

  const raw = await randomBytes(16)
  const generatedFilename = raw.toString('hex') + path.extname(filename)
  const outPath = path.join(uploadsPath, generatedFilename)

  await fs.ensureDir(uploadsPath)
  const outStream = fs.createWriteStream(outPath)
  stream.pipe(outStream, { encoding })

  return new Promise((resolve, reject) => {
    outStream.on('finish', () => resolve(outPath))
    outStream.on('error', reject)
  })
}
const resolvers = {
  Query: {},
  Mutation: {
    async createFile(_, { file, meta }, ctx) {
      const path = await upload(file)
      meta.url = `/static/${path}`
      const data = await new File(meta).save()

      return data
    },
  },
}

module.exports = resolvers
