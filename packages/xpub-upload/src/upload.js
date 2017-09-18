/* global CONFIG */

import endpoint from 'pubsweet-client/src/helpers/endpoint'
import token from 'pubsweet-client/src/helpers/token'

export default file => dispatch => {
  const data = new FormData()
  data.append('file', file)

  const request = new XMLHttpRequest()
  request.open('POST', endpoint + '/upload')
  request.setRequestHeader('Authorization', 'Bearer ' + token())
  request.setRequestHeader('Accept', 'text/plain') // the response is a URL
  request.send(data)

  return request
}
