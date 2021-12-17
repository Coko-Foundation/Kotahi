import axios from 'axios'
import { downloadZip } from 'client-zip'
import makeTemplate from './pdfTemplates/template'

// CAVEATS:
// 1) This only works with CORS turned off
// 2) This is entirely client-side and it uses the pagedjs server that Alex set up

const bearerToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImNsaWVudElkIjoiZDNlOTY4OTctNjIxYi00MzllLTkyYjEtNjc1M2RmMjc2NzA3In0sImlhdCI6MTYzOTE1NzY3MSwiZXhwIjoxNjY3OTU3NjcxfQ.8sF305tvn042OTnyb6ynKimEPK3ZaIh1Mw55AhrkfDM'

const pagedJsAPI = 'https://pagedjstest.cloud68.co/api/htmlToPDF'

const makeZip = async htmlText => {
  const index = {
    name: 'index.html',
    lastModified: new Date(),
    input: htmlText,
  }

  // get the ZIP stream in a Blob
  const blob = await downloadZip([index]).blob()

  return blob
}

const makePdf = async (html, articleMetadata) => {
  // 1 make HTML from html + front matter + CSS
  // console.log('Making PDF . . .')
  const outHtml = makeTemplate(html, articleMetadata.title || '')

  // 2 zip this.

  const zipBlob = await makeZip(outHtml)

  // console.log(zipUrl)

  // 3 check if we have an access token to the pagedjs server

  // send to server

  const formData = new FormData()
  // formData.append('html', outHtml)
  formData.append('zip', zipBlob, 'index.html.zip')
  axios
    .post(pagedJsAPI, formData, {
      headers: {
        Authorization: `Bearer ${bearerToken}`,
        'Content-Type': 'multipart/form-data',
      },
    })
    .then(async res => res.data)
    .then(resObj => {
      // It is necessary to create a new blob object with mime-type explicitly set for all browsers except Chrome, but it works for Chrome too.
      const newBlob = new Blob([resObj], { type: 'application/pdf' })

      // MS Edge and IE don't allow using a blob object directly as link href, instead it is necessary to use msSaveOrOpenBlob
      if (window.navigator && window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveOrOpenBlob(newBlob)
      } else {
        // For other browsers: create a link pointing to the ObjectURL containing the blob.
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
      }
    })

    .catch(err => console.error(err))

  // download PDF

  return outHtml
}

export default makePdf
