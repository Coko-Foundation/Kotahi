const htmlparser2 = require('htmlparser2')
const cheerio = require('cheerio')

const processTablesWithCaptions = html => {
  const dom = htmlparser2.parseDocument(html)
  const $ = cheerio.load(dom, { xmlMode: true })

  const tableList = $('table')

  if (tableList.length) {
    tableList.each((index, el) => {
      const thisTable = $(el)
      let newCaption = ''
      const thisTableCaption = thisTable.find('caption')

      // If we have a <caption> in the table, then we need to move it out of the table and into a <table-wrap>
      if (thisTableCaption.length) {
        // console.log(
        //   'Table caption HTML found: ',
        //   index,
        //   thisTableCaption.html(),
        // )
        newCaption = `<caption>${thisTableCaption.html()}</caption>`
        $(thisTableCaption).replaceWith('')
      }

      // TDs might be coming in with the data-colwidth attribute
      // We can just changed data-colwidth="234" to style="width: 234"

      let thisTableHtml = `<table-wrap>${newCaption}<table>${thisTable.html()}</table></table-wrap>`
      thisTableHtml = thisTableHtml.replaceAll(
        /data-colwidth="(\d*)"/g,
        `style="width:$1px"`,
      )
      $(thisTable).replaceWith(thisTableHtml)
    })
  }

  const deCaptionTabledHtml = $.html()

  return { deCaptionTabledHtml }
}

module.exports = processTablesWithCaptions
