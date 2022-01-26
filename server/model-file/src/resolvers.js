const crypto = require('crypto')
const { promisify } = require('util')
const fs = require('fs-extra')
const path = require('path')
const config = require('config')
const sharp = require('sharp')

const File = require('./file')

const randomBytes = promisify(crypto.randomBytes)
const uploadsPath = config.get('pubsweet-server').uploads

const upload = async file => {
  const { createReadStream, filename, encoding } = await file
  const stream = createReadStream()
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

const createImageVersions = async(buffer, filename) => {
    try {
      const outputWebpPath = path.join(uploadsPath, `${filename.toString('hex')}.webp`)
      await sharp(buffer).toFile(outputWebpPath)
      return {
        outputWebpPath
      }
    } catch (e) {
      throw new Error(e)
    } 
}

const uploadFileWithMultipleVersions =  async file => {
  const { createReadStream, filename, encoding } = await file
  const stream = createReadStream()
  const raw = await randomBytes(16)
  const generatedFilename = raw.toString('hex') + path.extname(filename)
  const outPath = path.join(uploadsPath, generatedFilename)
  
  await fs.ensureDir(uploadsPath)
  const outStream = fs.createWriteStream(outPath)
  stream.pipe(outStream, { encoding })
  
  const tempBuffs = []
  let buffer

  await new Promise((resolve, reject) => {
    stream.on('end', () => {
      buffer = Buffer.concat(tempBuffs)
      resolve()
    })
    stream.on('data', chunk => {
      tempBuffs.push(chunk)
    })
    stream.on('error', reject)
  })

  const localImageVersionPaths = await createImageVersions(
    buffer,
    raw
  )

  const { outputWebpPath } = localImageVersionPaths

  return { originalFilePath: outPath, webpFilePath: outputWebpPath }
}

const resolvers = {
  Query: {},
  Mutation: {
    async createFile(_, { file, meta }, ctx) {
      if (meta.fileType === "manuscriptImage") {
        const { originalFilePath, webpFilePath } = await uploadFileWithMultipleVersions(file)
        // eslint-disable-next-line no-param-reassign
        meta.url = `/static/${originalFilePath}`
        // eslint-disable-next-line
        let orginalFileData = await new File(meta).save()
        // eslint-disable-next-line no-param-reassign
        meta.url = `/static/${webpFilePath}`
        let webpFileData = await new File(meta).save()
        return webpFileData
      } else {
        const filePath = await upload(file)
        // eslint-disable-next-line no-param-reassign
        meta.url = `/static/${filePath}`
        let data = await new File(meta).save()
        return data
      }
    },
    async deleteFile(_, { id }, ctx) {
      await ctx.models.File.query().deleteById(id)
      return id
    },
  },
}

module.exports = resolvers
