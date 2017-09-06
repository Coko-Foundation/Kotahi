/* global CONFIG */

import token from 'pubsweet-client/src/helpers/token'

export default file => dispatch => {
  // TODO: import the endpoint URL from a client module
  const API_ENDPOINT = CONFIG['pubsweet-server'].API_ENDPOINT

  const data = new FormData()
  data.append('file', file)

  const request = new XMLHttpRequest()
  request.open('POST', API_ENDPOINT + '/upload')
  request.setRequestHeader('Authorization', 'Bearer ' + token())
  request.setRequestHeader('Accept', 'text/plain') // the response is a URL
  request.send(data)

  return request
}
