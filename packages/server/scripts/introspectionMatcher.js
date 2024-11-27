/* eslint-disable no-param-reassign */
/* eslint-disable no-console */
/* eslint-disable no-underscore-dangle */
const fs = require('fs')
const axios = require('axios')

axios
  .post(
    `http://localhost:3000/graphql`,
    JSON.stringify({
      variables: {},
      query: `
      {
        __schema {
          types {
            kind
            name
            possibleTypes {
              name
            }
          }
        }
      }
    `,
    }),
    { responseType: 'json' },
    { headers: { 'Content-Type': 'application/json' } },
  )
  .then(result => result.data)
  .then(result => {
    // here we're filtering out any type information unrelated to unions or interfaces
    const filteredData = result.data.__schema.types.filter(
      type => type.possibleTypes !== null,
    )

    result.data.__schema.types = filteredData
    fs.writeFile(
      './app/fragmentTypes.json',
      JSON.stringify(result.data),
      err => {
        if (err) {
          console.error('Error writing fragmentTypes file', err)
        } else {
          console.log('Fragment types successfully extracted!')
        }
      },
    )
  })
