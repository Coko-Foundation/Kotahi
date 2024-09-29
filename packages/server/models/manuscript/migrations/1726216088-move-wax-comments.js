const cheerio = require('cheerio')

const { useTransaction } = require('@coko/server')

const Manuscript = require('../manuscript.model')

const sanitizedDocument = input => {
  const $ = cheerio.load(input)

  $('h1').each((i, h) => {
    const content = $(h).html()
    $(h).replaceWith(`<h1>${content}&nbsp;&nbsp;</h1>`)
  })

  $('h2').each((i, h) => {
    const content = $(h).html()
    $(h).replaceWith(`<h2>${content}&nbsp;&nbsp;</h2>`)
  })

  $('h3').each((i, h) => {
    const content = $(h).html()
    $(h).replaceWith(`<h3>${content}&nbsp;&nbsp;</h3>`)
  })

  $('h4').each((i, h) => {
    const content = $(h).html()
    $(h).replaceWith(`<h4>${content}&nbsp;&nbsp;</h4>`)
  })

  $('h5').each((i, h) => {
    const content = $(h).html()
    $(h).replaceWith(`<h5>${content}&nbsp;&nbsp;</h5>`)
  })

  $('h6').each((i, h) => {
    const content = $(h).html()
    $(h).replaceWith(`<h6>${content}&nbsp;&nbsp;</h6>`)
  })

  $('p').each((i, p) => {
    const content = $(p).html()
    $(p).replaceWith(`<p>${content}&nbsp;&nbsp;</p>`)
  })

  const listItems = $('li')
  const listArray = listItems.toArray()

  // Loop through the array in reverse order
  for (let i = listArray.length - 1; i >= 0; i -= 1) {
    const l = listArray[i]

    const content = $(l).html()

    $(l).replaceWith(`<li>&nbsp;&nbsp;${content}</li>`)
  }

  const olItems = $('ol')
  const olArray = olItems.toArray()

  for (let i = olArray.length - 1; i >= 0; i -= 1) {
    const o = olArray[i]

    const content = $(o).html()

    $(o).replaceWith(`<ol>${content}&nbsp;&nbsp;</ol>`)
  }

  const ulItems = $('ul')
  const ulArray = ulItems.toArray()

  for (let i = ulArray.length - 1; i >= 0; i -= 1) {
    const u = ulArray[i]

    const content = $(u).html()

    $(u).replaceWith(`<ul>${content}&nbsp;&nbsp;</ul>`)
  }

  $('footnote').each((i, footnote) => {
    const content = $(footnote).html()
    $(footnote).replaceWith(`<footnote>${content}&nbsp;&nbsp;</footnote>`)
  })

  $('pre code').each((i, code) => {
    const content = $(code).html()
    $(code).replaceWith(`<code>${content}&nbsp;&nbsp;</code>`)
  })

  $('blockquote').each((i, b) => {
    const content = $(b).html()
    $(b).replaceWith(`<blockquote>${content}&nbsp;&nbsp;</blockquote>`)
  })

  $('section').each((i, b) => {
    const content = $(b).html()
    $(b).replaceWith(`<section>${content}&nbsp;&nbsp;</section>`)
  })

  $('figure').each((i, f) => {
    const content = $(f).html()
    $(f).replaceWith(`<figure>${content}&nbsp;&nbsp;</figure>`)
  })

  $('math-display').each((i, m) => {
    const content = $(m).html()
    $(m).replaceWith(`<math-display>${content}&nbsp;&nbsp;</math-display>`)
  })

  $('math-inline').each((i, m) => {
    const content = $(m).html()
    $(m).replaceWith(`<math-inline>${content}&nbsp;&nbsp;</math-inline>`)
  })

  $('table').each((i, table) => {
    const content = $(table).html()
    $(table).replaceWith(`<table>&nbsp;&nbsp;${content}</table>`)
  })

  $('tbody').each((i, tbody) => {
    const content = $(tbody).html()
    $(tbody).replaceWith(`<tbody>&nbsp;&nbsp;${content}</tbody>`)
  })

  $('tr').each((i, tr) => {
    const content = $(tr).html()
    $(tr).replaceWith(`<tr>&nbsp;&nbsp;${content}</tr>`)
  })

  $('th').each((i, th) => {
    const content = $(th).html()
    $(th).replaceWith(`<th>&nbsp;&nbsp;${content}</th>`)
  })

  $('td').each((i, td) => {
    const content = $(td).html()
    $(td).replaceWith(`<td>&nbsp;&nbsp;${content}</td>`)
  })

  return $
}

exports.up = async db => {
  const manuscripts = await Manuscript.find({})

  await useTransaction(async trx => {
    await Promise.all(
      manuscripts.result.map(async manuscript => {
        const content = manuscript.meta?.source
        if (!content) return

        const $ = cheerio.load(content)
        const commentNodes = $('[data-conversation]')
        const newCommentData = []

        commentNodes.each((i, node) => {
          const id = node.attribs['data-id']
          const conversation = node.attribs['data-conversation']
          const viewId = node.attribs['data-viewid']
          const group = node.attribs['data-group']
          const title = node.attribs['data-title']

          const $$ = sanitizedDocument(content)

          const innerHTML = $$(node).html()
          const commentText = $$(node).text()

          $$(`[data-id=${id}]`).replaceWith(`<span>${id}${innerHTML}</span>`)

          const pure = $$.text()
          const startPosition = pure.indexOf(id) + 1
          const endPosition = startPosition + commentText.length

          const newComment = {
            id,
            from: startPosition,
            to: endPosition,
            data: {
              type: 'comment',
              pmFrom: startPosition,
              pmTo: endPosition,
              conversation: JSON.parse(conversation),
              title,
              group,
              viewId,
            },
          }

          newCommentData.push(newComment)
        })

        const metaObj = manuscript.meta
        metaObj.comments = newCommentData

        await manuscript.patch(
          {
            meta: metaObj,
          },
          { trx },
        )
      }),
    )
  })
}

exports.down = async db => {
  /**
   * No rollback needed. We do not delete the original data from the HTML.
   * This means that reverting to the old version of wax will pick up the old
   * data and render them as expected.
   */
}
