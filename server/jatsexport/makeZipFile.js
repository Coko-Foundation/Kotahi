const htmlparser2 = require('htmlparser2')
const cheerio = require('cheerio')
const { createFile, deleteFiles, File } = require('@coko/server')

const makeZipFile = async (manuscriptId, jats, supplementaryFiles) => {
  // jats is a string with the processed JATS in it
  // supplementary files is a list of file IDs for supplementary files, if there are any

  console.log('JATS: ', jats)

  const files = await File.query().where({
    objectId: manuscriptId,
  })

  // console.log('Files: ', files)

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
    const fileData = files.find(x => x.id === fileId)
    // console.log(fileData)

    imageList[imageList.length] = fileData

    // should come back with something liek this inside of <figure>:
    // 	<alternatives>
    // 	<graphic specific-use="print" xlink:href="1.4821168.figures.highres.f3.zip"/>
    // 	<graphic specific-use="online" xlink:href="1.4821168.figures.online.f3.jpg"/>
    //  </alternatives>

    let outHtml = `<alternatives>`

    for (let i = 0; i < fileData.storedObjects.length; i++) {
      outHtml += `<graphic title="${fileData.name}_${fileData.storedObjects[i].type}" xlink:href="images/${fileData.storedObjects[i].key}" />`
    }

    outHtml += `</alternatives>`

    $elem.replaceWith(outHtml)
    return $elem
  })

  const outJats = $.html()

  // 3. check if there are supplementary files
  // 4. if so, get a list of all the files

  if (supplementaryFiles && supplementaryFiles.length) {
    console.log('Going through supplementary files')
  }

  // 5. make a directory with the JATS file as index.xml

  if (imageList.length) {
    console.log('Image files: ', imageList)
    // 5.1. make a subdir "images"
    // 5.2. for each image ID, get all the versions of files with that ID
    // 5.3. put all of those files in the subdir
  }

  if (suppFileList.lenght) {
    // 5.4. make a subdir "supplementary"
    // 5.5. get all the supplementary files
    // 5.6. put all of those files in the subdir
    // Should look something like this:
    //
    // <supplementary-material id="S1" xmlns:xlink="http://www.w3.org/1999/xlink"
    // xlink:title="local_file" xlink:href="pbio-0020328-t002.xls"
    // mimetype="application/vnd.ms-excel">
  }

  // 6. zip the directory
  // 7. return the link to the zip file

  // 8. cleanup???

  console.log('outJats: ', outJats)
  return { link: '', jats: outJats } // returns link to where the ZIP file is.
}

module.exports = makeZipFile
