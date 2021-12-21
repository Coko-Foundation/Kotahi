import axios from 'axios'
import { downloadZip } from 'client-zip'
import makeTemplate from './pdfTemplates/template'
import css from './pdfTemplates/styles'

// CAVEATS:
// 1) This only works with CORS turned off
// 2) This is entirely client-side and it uses the pagedjs server that Alex set up

const bearerToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImNsaWVudElkIjoiZDNlOTY4OTctNjIxYi00MzllLTkyYjEtNjc1M2RmMjc2NzA3In0sImlhdCI6MTYzOTE1NzY3MSwiZXhwIjoxNjY3OTU3NjcxfQ.8sF305tvn042OTnyb6ynKimEPK3ZaIh1Mw55AhrkfDM'

const pagedJsAPI = 'https://pagedjstest.cloud68.co/api/htmlToPDF'

const makeZip = async htmlText => {
  const blob = await downloadZip([
    {
      name: 'index.html',
      lastModified: new Date(),
      input: htmlText,
    },
    { name: 'styles.css', lastModified: new Date(), input: css },
    // could insert an override CSS here by appending to styles.css
  ]).blob()

  return blob
}

const makePdf = async (html, articleMetadata) => {
  // console.log(articleMetadata)
  // 0 strip content out of the HTML that shouldn't be in there (annotations)
  // 1 make HTML from html + front matter + CSS

  // console.log('Making PDF . . .')

  // TODO: maybe put up a modal explaining that a PDF is being made?

  // this runs the HTML from Wax through a template, feeding it variables
  const outHtml = makeTemplate(html, {
    title: articleMetadata.title || '',
    author: articleMetadata?.submission?.name || '',
    contact: articleMetadata?.submission?.contact || '',
    affiliation: articleMetadata?.submission?.affiliation || '',
    keywords: articleMetadata?.submission?.keywords || '',
    pubDate: articleMetadata?.pubDate || new Date(),
  })

  // 2 zip this.

  const zipBlob = await makeZip(outHtml)

  // this code is for testing the zip that's been created:

  // const url = URL.createObjectURL(zipBlob)
  // const link = document.createElement('a')
  // link.href = url
  // link.download = `${articleMetadata.title || 'title'}.zip`
  // link.click()

  // 3 check if we have an access token to the pagedjs server

  // 4 send to server

  // eslint-disable-next-line no-console
  console.log('Sending PDF to server!')
  const formData = new FormData()
  formData.append('zip', zipBlob, 'index.html.zip')
  axios
    .post(pagedJsAPI, formData, {
      responseType: 'arraybuffer',
      headers: {
        Authorization: `Bearer ${bearerToken}`,
        'Content-Type': 'multipart/form-data',
      },
    })
    .then(async res => res.data)
    .then(resObj => {
      // eslint-disable-next-line no-console
      console.log('Retrieved PDF!')
      const newBlob = new Blob([resObj], { type: 'application/pdf' })

      const objUrl = window.URL.createObjectURL(newBlob)

      // use this code to open PDF in new window:

      window.open(objUrl)

      // use this code for downloading the PDF:

      const link = document.createElement('a')
      link.href = objUrl
      link.download = `${articleMetadata.title || 'title'}.pdf`
      link.click()

      // console.log(`Downloading ${link.download}`)

      // For Firefox it is necessary to delay revoking the ObjectURL.

      setTimeout(() => {
        window.URL.revokeObjectURL(objUrl)
      }, 1000)
    })

    .catch(err => console.error(err))

  // download PDF

  return outHtml
}

export default makePdf
