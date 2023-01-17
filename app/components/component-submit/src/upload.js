/* eslint-disable no-unused-vars */
import config from 'config'
import request from 'pubsweet-client/src/helpers/api'
import { gql } from '@apollo/client'
import { map } from 'lodash'
import * as cheerio from 'cheerio'
import currentRolesVar from '../../../shared/currentRolesVar'

const fragmentFields = `
  id
  meta {
    source
    manuscriptId
  }
`

const urlFrag = config.journal.metadata.toplevel_urlfragment

const stripTags = file => {
  // eslint-disable-next-line no-useless-escape
  const reg = /<container id="main">([\s\S]*?)<\/container>/
  return file.match(reg)[1]
}

const cleanMath = file => {
  // Note: both inline and display equations were coming in from xSweet with
  // $$ around them. This code removes them.

  const displayStart = /<math-display class="math-node">\s*\$\$/g
  const displayEnd = /\$\$\s*<\/math-display>/g
  const inlineStart = /<math-inline class="math-node">\s*\$\$/g
  const inlineEnd = /\$\$\s*<\/math-inline>/g

  const cleanedFile = file
    .replaceAll(displayStart, `<math-display class="math-node">`)
    .replaceAll(inlineStart, `<math-inline class="math-node">`)
    .replaceAll(displayEnd, `</math-display>`)
    .replaceAll(inlineEnd, `</math-inline>`)

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
    const mimeType = e.src.match(/[^:]\w+\/[\w\-+.]+(?=;base64,)/)[0]
    const blob = base64toBlob(e.src, mimeType)
    const mimeTypeSplit = mimeType.split('/')
    const extFileName = mimeTypeSplit[1]

    const file = new File([blob], `Image${index + 1}.${extFileName}`, {
      type: mimeType,
    })

    return { dataSrc: e.src, mimeType, file }
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

const DocxToHTMLPromise = (file, data) => {
  const body = new FormData()
  body.append('docx', file)

  const url = `${config['pubsweet-client'].baseUrl}/convertDocxToHTML`

  return request(url, { method: 'POST', body }).then(response =>
    Promise.resolve({
      fileURL: data.uploadFile.storedObjects[0].url,
      response,
    }),
  )
}

const createManuscriptPromise = (
  file,
  data,
  client,
  currentUser,
  fileURL,
  response,
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
  }

  return client.mutate({
    mutation: createManuscriptMutation,
    variables: { input: manuscript },
    update: (cache, { data: { createManuscript } }) => {
      const currentRoles = currentRolesVar()
      currentRolesVar([
        ...currentRoles,
        { id: createManuscript.id, roles: ['author'] },
      ])
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

const redirectPromise = (setConversionState, journals, history, data) => {
  setConversionState(() => ({ converting: false, completed: true }))
  const route = `${urlFrag}/versions/${data.createManuscript.id}/submit`
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
          fileURL: data.uploadFile.url,
          response: true,
        }
      } else {
        uploadResponse = await DocxToHTMLPromise(file, data)
        uploadResponse.response = cleanMath(stripTags(uploadResponse.response))

        images = base64Images(uploadResponse.response)
      }

      manuscriptData = await createManuscriptPromise(
        file,
        data,
        client,
        currentUser,
        uploadResponse.fileURL,
        uploadResponse.response,
      )

      // Moving the below logic to server-side 'createManuscript' to fix slow docx uploads
      // To be removed after testing the new logic
      // if (typeof uploadResponse.response === 'string') {
      //   let source = uploadResponse.response
      //   // eslint-disable-next-line
      //   let uploadedImages = Promise.all(
      //     map(images, async image => {
      //       const uploadedImage = await uploadImage(
      //         image,
      //         client,
      //         manuscriptData.data.createManuscript.id,
      //       )

      //       return uploadedImage
      //     }),
      //   )

      //   await uploadedImages.then(results => {
      //     const $ = cheerio.load(source)

      //     $('img').each((i, elem) => {
      //       const $elem = $(elem)

      //       if (images[i].dataSrc === $elem.attr('src')) {
      //         $elem.attr('data-fileid', results[i].data.createFile.id)
      //         $elem.attr('alt', results[i].data.createFile.name)
      //         $elem.attr(
      //           'src',
      //           results[i].data.createFile.storedObjects.find(
      //             storedObject => storedObject.type === 'medium',
      //           ).url,
      //         )
      //       }
      //     })

      //     source = $.html()

      //     const manuscript = {
      //       id: manuscriptData.data.createManuscript.id,
      //       meta: {
      //         source,
      //       },
      //     }

      //     // eslint-disable-next-line
      //     const updatedManuscript = client.mutate({
      //       mutation: updateMutation,
      //       variables: {
      //         id: manuscriptData.data.createManuscript.id,
      //         input: JSON.stringify(manuscript),
      //       },
      //     })

      //     manuscriptData.data.createManuscript.meta.source = source
      //   })
      // }
    } else {
      // Create a manuscript without a file
      manuscriptData = await createManuscriptPromise(
        undefined,
        undefined,
        client,
        currentUser,
        undefined,
        undefined,
      )
    }

    return redirectPromise(
      setConversion,
      journals,
      history,
      manuscriptData.data,
    )
  } catch (error) {
    setConversion({ error })
  }

  return false
}
