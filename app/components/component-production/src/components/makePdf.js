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
  // get the ZIP stream in a Blob
  const blob = await downloadZip([
    {
      name: 'index.html',
      lastModified: new Date(),
      input: htmlText,
    },
    { name: 'styles.css', lastModified: new Date(), input: css },
  ]).blob()

  return blob
}

const makePdf = async (html, articleMetadata) => {
  // 1 make HTML from html + front matter + CSS
  // console.log('Making PDF . . .')
  const outHtml = makeTemplate(html, articleMetadata.title || '')

  // 2 zip this.

  const zipBlob = await makeZip(outHtml)

  // const url = URL.createObjectURL(zipBlob)
  // const link = document.createElement('a')
  // link.href = url
  // link.download = `${articleMetadata.title || 'title'}.zip`
  // link.click()

  // console.log(zipUrl)

  // 3 check if we have an access token to the pagedjs server

  // send to server

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
      const newBlob = new Blob([resObj], { type: 'application/pdf' })

      const objUrl = window.URL.createObjectURL(newBlob)

      const link = document.createElement('a')
      link.href = objUrl
      link.download = `${articleMetadata.title || 'title'}.pdf`
      link.click()
      // console.log(`Downloading ${link.download}`)

      // For Firefox it is necessary to delay revoking the ObjectURL.
      setTimeout(() => {
        window.URL.revokeObjectURL(objUrl)
      }, 250)
    })

    .catch(err => console.error(err))

  // download PDF

  return outHtml
}

export default makePdf
