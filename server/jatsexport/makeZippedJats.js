const http = require('http')
const fs = require('fs-extra')
const fsPromised = require('fs').promises
const crypto = require('crypto')
const htmlparser2 = require('htmlparser2')
const cheerio = require('cheerio')
const { promisify } = require('util')
const { createFile, fileStorage, File } = require('@coko/server')
const makeZip = require('../pdfexport/ziputils.js')

const randomBytes = promisify(crypto.randomBytes)

const downloadFile = (url, dest, cb) => {
  const file = fs.createWriteStream(dest)
  http.get(url, response => {
    response.pipe(file)
    file.on('finish', () => {
      file.close(cb)
    })
  })
}

const { getFileWithUrl } = require('../utils/fileStorageUtils')

const makeZipFile = async (manuscriptId, jats) => {
  // jats is a string with the semi-processed JATS in it
  // (images have not been dealt with)

  const manuscriptFiles = await File.query().where({
    objectId: manuscriptId,
  })

  // console.log('Files: ', manuscriptFiles)

  const imageList = []
  const suppFileList = []
  const dom = htmlparser2.parseDocument(jats)
  const $ = cheerio.load(dom, { xmlMode: true })

  // What needs to happen:
  // 1. check if there are images in the jats
  // 2. if so, get a list of all files

  $('graphic').each(async (index, el) => {
    const $elem = $(el)
    const fileId = $elem.attr('id').replace('graphic_', '')
    const imageFileData = manuscriptFiles.find(x => x.id === fileId)
    // console.log(fileData)

    imageList[imageList.length] = imageFileData

    // should come back with something liek this inside of <figure>:
    // 	<alternatives>
    // 	<graphic specific-use="print" xlink:href="1.4821168.figures.highres.f3.zip"/>
    // 	<graphic specific-use="online" xlink:href="1.4821168.figures.online.f3.jpg"/>
    //  </alternatives>

    let outHtml = `<alternatives>`

    for (let i = 0; i < imageFileData.storedObjects.length; i += 1) {
      outHtml += `<graphic title="${imageFileData.name}_${imageFileData.storedObjects[i].type}" xlink:href="images/${imageFileData.storedObjects[i].key}" />`
    }

    outHtml += `</alternatives>`

    $elem.replaceWith(outHtml)
    return $elem
  })

  let outJats = $.html()

  // 3. check if there are supplementary files
  // 4. if so, get a list of all the files

  const supplementaryFiles = manuscriptFiles.filter(
    x => x.tags.includes('supplementary') || x.tags.includes('visualAbstract'),
  )

  if (supplementaryFiles && supplementaryFiles.length) {
    console.error('Supplementary files found!')

    let supplementaryJats = ''

    // loop through them, for each one, add this to  supplementaryJats:
    for (let i = 0; i < supplementaryFiles.length; i += 1) {
      const myOriginal = supplementaryFiles[i].storedObjects.find(
        x => x.type === 'original',
      )

      suppFileList[suppFileList.length] = supplementaryFiles[i]

      const mimeType = myOriginal.mimeType
        ? `mimetype="${myOriginal.mimeType.split('-')[0]}" mime-subtype="${
            myOriginal.mimeType.split('-')[1]
          }" `
        : ''

      supplementaryJats += `<supplementary-material id="supplementary-material-${i}" xlink:href="supplementary/${supplementaryFiles[i].name}" ${mimeType}/>`
    }

    outJats = outJats.replace(
      '</body>',
      `<sec sec-type="supplementary-files"><title>Supplementary Files</title>${supplementaryJats}</sec></body>`,
    )
  }

  // 5. make a directory with the JATS file as index.xml

  const raw = await randomBytes(16)
  const dirName = `tmp/${raw.toString('hex')}_${manuscriptId}`
  await fsPromised.mkdir(dirName, { recursive: true })
  await fsPromised.appendFile(`${dirName}/index.xml`, outJats)

  if (imageList.length) {
    const imageDirName = `${dirName}/images`
    await fsPromised.mkdir(imageDirName, { recursive: true })

    const imageObjects = imageList.flatMap(x => x.storedObjects)

    imageObjects.forEach(async imageObject => {
      const url = await fileStorage.getURL(imageObject.key)

      const targetPath = `${imageDirName}/${imageObject.key}`
      downloadFile(url, targetPath, () => {
        console.error(`Attached image ${imageObject.key}`)
      })
    })
  }

  if (suppFileList.length) {
    // 5.4. make a asubdir "supplementary"
    const suppDirName = `${dirName}/supplementary`
    await fsPromised.mkdir(suppDirName, { recursive: true })

    const suppObjects = suppFileList
      .flatMap(x => x.storedObjects)
      .filter(x => x.type === 'original')

    suppObjects.forEach(async suppObject => {
      const url = await fileStorage.getURL(suppObject.key)

      const targetPath = `${suppDirName}/${suppObject.key}`
      downloadFile(url, targetPath, () => {
        console.error(`Attached supplementary file ${suppObject.key}.`)
      })
    })
  }

  const zipPath = await makeZip(dirName)

  const createdFile = await createFile(
    fs.createReadStream(`${zipPath}`),
    `${manuscriptId}.zip`,
    null,
    null,
    ['zippedJats'],
    manuscriptId,
  )

  const downloadReadyZipFile = await getFileWithUrl(createdFile)

  const { url } = downloadReadyZipFile.storedObjects[0]

  // TODO: cleanup???

  return { link: url, jats: outJats } // returns link to where the ZIP file is.
}

module.exports = makeZipFile
