/* eslint-disable no-unused-vars */
import request from 'pubsweet-client/src/helpers/api'
import { gql } from '@apollo/client'
// import { map } from 'lodash'
import * as cheerio from 'cheerio'

const fragmentFields = `
  id
  meta {
    source
    manuscriptId
  }
`

const stripTags = file => {
  // eslint-disable-next-line no-useless-escape
  const reg = /<container id="main">([\s\S]*?)<\/container>/
  return file.match(reg)[1]
}

const cleanOutWmfs = file => {
  const wmfRegex = /"data:image\/[ew]mf;base64,[0-9a-zA-Z/+=]*"/g

  return file.replaceAll(
    wmfRegex,
    '"" alt="Broken image" data-original-name="broken-image"',
  )
}

const checkForEmptyBlocks = file => {
  // what we want is inside container#main
  const parser = new DOMParser()
  const doc = parser.parseFromString(file, 'text/html')
  const inside = doc.querySelector('container#main')

  for (let i = 0; i < inside.childNodes.length; i += 1) {
    if (!inside.childNodes[i].tagName) {
      const text = inside.childNodes[i].data

      if (/\S/.test(text)) {
        // We've found unwrapped text! Wrap it in <p></p>
        console.error('Found unwrapped child node: ', inside.childNodes[i].data)
        const p = doc.createElement('p')
        p.innerHTML = inside.childNodes[i].data
        inside.replaceChild(p, inside.childNodes[i])
      }
    } else {
      // TODO: Only first node images are wrapped with 'figure' tag. Child image node within e.g. a 'p' are ignored!
      // Below code is a example of the above mentioned scenario
      // if (inside.childNodes[i].tagName === 'P') {
      //   if (inside.childNodes[i].childNodes[0]?.tagName === 'IMG') {
      //     console.error(
      //       'Found unwrapped <img> tag:',
      //       inside.childNodes[i].childNodes[0],
      //     )
      //     const figure = doc.createElement('figure')

      //     if (!inside.childNodes[i + 1]) {
      //       console.error('No next sibling, adding dummy paragraph')
      //       const dummyp = doc.createElement('p')
      //       inside.appendChild(dummyp)
      //     }

      //     figure.appendChild(inside.childNodes[i])
      //     inside.replaceChild(figure, inside.childNodes[i])
      //   }
      // }

      if (inside.childNodes[i].tagName === 'A') {
        console.error('Found unwrapped <a> tag:', inside.childNodes[i])
        const p = doc.createElement('p')
        p.appendChild(inside.childNodes[i])
        inside.replaceChild(p, inside.childNodes[i])
      }

      if (inside.childNodes[i].tagName === 'IMG') {
        console.error('Found unwrapped <img> tag:', inside.childNodes[i])
        const figure = doc.createElement('figure')

        if (!inside.childNodes[i + 1]) {
          console.error('No next sibling, adding dummy paragraph')
          const dummyp = doc.createElement('p')
          inside.appendChild(dummyp)
        }

        figure.appendChild(inside.childNodes[i])
        inside.replaceChild(figure, inside.childNodes[i])
      }
    }
  }

  const out = document.createElement('container')
  out.appendChild(inside)
  out.id = 'main'
  return out.innerHTML
}

const stripTrackChanges = file => {
  // PROBLEMATIC FIX FOR XSWEET
  // This function strips out track changes spans from the HTML returned from xSweet
  // It would be more efficient to do this on the xSweet side! This is done client-side
  // and is probably shower than it needs to be.

  const $ = cheerio.load(file)
  // might be smarter to do this with DOMParser? We were already importing cheerio.

  const stripSpans = () => {
    $('span').each((index, el) => {
      if (el.attribs.class && el.attribs.class.indexOf('format-change') > -1) {
        // console.log('format change: ', $(el).html())
        $(el).replaceWith($(el).html())
      }

      if (el.attribs.class && el.attribs.class.indexOf('insertion') > -1) {
        // console.log('insertion: ', $(el).html())
        $(el).replaceWith($(el).html())
      }

      if (el.attribs.class && el.attribs.class.indexOf('deletion') > -1) {
        // console.log('deletion: ', $(el).html())
        $(el).replaceWith('')
      }
    })
  }

  if ($('span.format-change,span.insertion,span.deletion').length) {
    // don't run this if we don't have to.
    stripSpans()
  }

  if ($('span.format-change,span.insertion,span.deletion').length) {
    // Because there may be nested spans, we need to run this function again to make sure we get everything.
    stripSpans()
  }

  return $.html()
}

const cleanMath = file => {
  // PROBLEMATIC FIX FOR XSWEET
  //
  // Sometimes math comes in in the form <h4><h4><math-display>...math...</math-display></h4></h4>
  // It should not be coming in like this! If the duplicated <h4>s are replaced by <p>, math processing works correctly

  // console.log('Coming in:\n\n\n', file, '\n\n\n')
  const dupedHeaderMathRegex = /<h[1-6]>\s*<\/h[1-6]>\s*<h[1-6]>(<math-(?:inline|display)[^>]*>)([\s\S]*?)(<\/math-(?:inline|display)>)\s*<\/h[1-6]>/g

  // A second fix: math was coming in like this: <h3></h3><h3><math-display>...math...</math-display></h3>

  const dupedHeaderMathRegex2 = /<h[1-6]>\s*<h[1-6]>(<math-(?:inline|display)[^>]*>)([\s\S]*?)(<\/math-(?:inline|display)>)\s*<\/h[1-6]>\s*<\/h[1-6]>/g

  const dedupedFile = file
    .replaceAll(dupedHeaderMathRegex, `<p>$1$2$3</p>`)
    .replaceAll(dupedHeaderMathRegex2, `<p>$1$2$3</p>`)

  // Note: both inline and display equations were coming in from xSweet with
  // $$ around them. This code removes them.

  const displayStart = /<math-display class="math-node">\s*\$\$/g
  const displayEnd = /\$\$\s*<\/math-display>/g
  const inlineStart = /<math-inline class="math-node">\s*\$\$/g
  const inlineEnd = /\$\$\s*<\/math-inline>/g

  const cleanedFile = dedupedFile
    .replaceAll(displayStart, `<math-display class="math-node">`)
    .replaceAll(inlineStart, `<math-inline class="math-node">`)
    .replaceAll(displayEnd, `</math-display>`)
    .replaceAll(inlineEnd, `</math-inline>`)

  // console.log('Coming out:\n\n\n', cleanedFile, '\n\n\n')

  return cleanedFile
}

const generateTitle = name =>
  name
    .replace(/[_-]+/g, ' ') // convert hyphens/underscores to space
    .replace(/\.[^.]+$/, '') // remove file extension

// TODO: preserve italics (use parse5?)
const extractTitle = source => {
  const doc = new DOMParser().parseFromString(source, 'text/html')
  const heading = doc.querySelector('h1')

  return heading ? heading.textContent : null
}

const uploadManuscriptMutation = gql`
  mutation($file: Upload!) {
    uploadFile(file: $file) {
      name
      storedObjects {
        type
        key
        size
        mimetype
        extension
        url
        imageMetadata {
          width
          height
          space
          density
        }
      }
    }
  }
`

const createManuscriptMutation = gql`
  mutation($input: ManuscriptInput) {
    createManuscript(input: $input) {
      id
      created
      manuscriptVersions {
        id
      }
      teams {
        id
        role
        name
        objectId
        objectType
        members {
          id
          user {
            id
            username
          }
          status
        }
      }
      status
      reviews {
        open
        created
        user {
          id
          username
        }
      }
      meta {
        source
        manuscriptId
        title
        history {
          type
          date
        }
      }
    }
  }
`

const createFileMutation = gql`
  mutation($file: Upload!, $meta: FileMetaInput!) {
    createFile(file: $file, meta: $meta) {
      id
      name
      objectId
      storedObjects {
        type
        key
        size
        mimetype
        extension
        url
      }
    }
  }
`

export const updateMutation = gql`
  mutation($id: ID!, $input: String) {
    updateManuscript(id: $id, input: $input) {
      id
      ${fragmentFields}
    }
  }
`

const base64toBlob = (base64Data, contentType) => {
  const sliceSize = 1024
  const arr = base64Data.split(',')
  const byteCharacters = atob(arr[1])
  const bytesLength = byteCharacters.length
  const slicesCount = Math.ceil(bytesLength / sliceSize)
  const byteArrays = new Array(slicesCount)

  for (let sliceIndex = 0; sliceIndex < slicesCount; sliceIndex += 1) {
    const begin = sliceIndex * sliceSize
    const end = Math.min(begin + sliceSize, bytesLength)

    const bytes = new Array(end - begin)

    for (let offset = begin, i = 0; offset < end; i += 1, offset += 1) {
      bytes[i] = byteCharacters[offset].charCodeAt(0)
    }

    byteArrays[sliceIndex] = new Uint8Array(bytes)
  }

  return new Blob(byteArrays, { type: contentType || '' })
}

const base64Images = source => {
  const doc = new DOMParser().parseFromString(source, 'text/html')

  const images = [...doc.images].map((e, index) => {
    const isDataUrl = e.src.match(/[^:]\w+\/[\w\-+.]+(?=;base64,)/)

    if (isDataUrl) {
      const mimeType = isDataUrl[0]
      const blob = base64toBlob(e.src, mimeType)
      const mimeTypeSplit = mimeType.split('/')
      const extFileName = mimeTypeSplit[1]

      const file = new File([blob], `Image${index + 1}.${extFileName}`, {
        type: mimeType,
      })

      return { dataSrc: e.src, mimeType, file }
    }

    return null
  })

  return images || null
}

const uploadImage = (image, client, manuscriptId) => {
  const { file } = image

  const meta = {
    fileType: 'manuscriptImage',
    manuscriptId,
    reviewId: null,
  }

  const data = client.mutate({
    mutation: createFileMutation,
    variables: {
      file,
      meta,
    },
  })

  return data
}

const uploadPromise = (files, client) => {
  const [file] = files

  if (files.length > 1) {
    throw new Error('Only one manuscript file can be uploaded')
  }

  return client.mutate({
    mutation: uploadManuscriptMutation,
    variables: { file },
  })
}

const getHtmlFromDocxQuery = gql`
  query($url: String!) {
    docxToHtml(url: $url) {
      html
      error
    }
  }
`

const DocxToHTMLPromise = (file, data, client) => {
  const theUrl = data.uploadFile.storedObjects[0].url

  return client
    .query({
      query: getHtmlFromDocxQuery,
      variables: {
        url: theUrl,
      },
      fetchPolicy: 'network-only',
    })
    .then(result => {
      if (result?.data?.docxToHtml?.html && !result?.data?.docxToHtml?.error) {
        return {
          response: `<container id="main">${result.data.docxToHtml.html}</container>`,
          fileURL: theUrl,
        }
      }

      console.error('Server-side error: ', result.data.docxToHtml.error)
      return file
    })
}

const createManuscriptPromise = (
  file,
  data,
  client,
  currentUser,
  fileURL,
  response,
  config,
) => {
  // In the case of a Docx file, response is the HTML
  // In the case of another type of file, response is true/false
  if (file && !response) {
    throw new Error('The file was not converted')
  }

  // We support file-less submissions too
  let source
  let title
  let files = []

  if (file) {
    source = typeof response === 'string' ? response : undefined
    title = extractTitle(response) || generateTitle(file.name)
    /* eslint-disable-next-line no-param-reassign */
    delete data.uploadFile.storedObjects[0].url
    files = [
      {
        name: file.name,
        storedObjects: data.uploadFile.storedObjects,
        tags: ['manuscript'],
      },
    ]
  } else {
    title = `New submission ${new Date().toLocaleString()}`
  }

  const manuscript = {
    files,
    meta: {
      title,
      source,
    },
    groupId: config.groupId,
  }

  return client.mutate({
    mutation: createManuscriptMutation,
    variables: { input: manuscript },
    update: (cache, { data: { createManuscript } }) => {
      cache.modify({
        fields: {
          manuscripts(existingManuscriptRefs = []) {
            // Get the reference for the cache entry generated by useMutation
            const newManuscriptRef = cache.writeFragment({
              data: createManuscript,
              fragment: gql`
                fragment NewManuscript on Manuscript {
                  id
                }
              `,
            })

            return [...existingManuscriptRefs, newManuscriptRef]
          },
        },
      })
    },
  })
}

const redirectPromise = (
  setConversionState,
  journals,
  history,
  data,
  config,
) => {
  setConversionState(() => ({ converting: false, completed: true }))
  const { urlFrag } = config

  // redirect after a new submission path
  const route = `${urlFrag}/versions/${data.createManuscript.id}/${
    ['elife', 'ncrc'].includes(config.instanceName) ? 'evaluation' : 'submit'
  }`

  // redirect after a short delay
  window.setTimeout(() => {
    history.push(route)
  }, 2000)
}

const skipXSweet = file =>
  !(
    file.type ===
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  )

export default ({
  client,
  history,
  journals,
  currentUser,
  setConversion,
  config,
}) => async files => {
  setConversion({ converting: true })
  let manuscriptData
  let uploadResponse
  let images

  try {
    if (files) {
      const [file] = files
      const { data } = await uploadPromise(files, client)

      if (skipXSweet(file)) {
        uploadResponse = {
          fileURL: data.uploadFile.url, // I think this should be data.uploadFile[0].url if this is actually used?
          response: true,
        }
      } else {
        uploadResponse = await DocxToHTMLPromise(file, data, client)
        uploadResponse.response = cleanOutWmfs(
          cleanMath(
            stripTags(
              stripTrackChanges(checkForEmptyBlocks(uploadResponse.response)),
            ),
          ),
        )
        images = base64Images(uploadResponse.response)
      }

      manuscriptData = await createManuscriptPromise(
        file,
        data,
        client,
        currentUser,
        uploadResponse.fileURL,
        uploadResponse.response,
        config,
      )
    } else {
      // Create a manuscript without a file
      manuscriptData = await createManuscriptPromise(
        undefined,
        undefined,
        client,
        currentUser,
        undefined,
        undefined,
        config,
      )
    }

    return redirectPromise(
      setConversion,
      journals,
      history,
      manuscriptData.data,
      config,
    )
  } catch (error) {
    setConversion({ error })
  }

  return false
}
