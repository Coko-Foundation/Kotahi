/* eslint-disable no-console */
const AWS = require('aws-sdk')

const accesskeid = process.env.S3_ACCESS_KEY_ID
const secretaccesskey = process.env.S3_ACCESS_KEY_SECRET
const s3endpoint = process.env.S3_ENDPOINT
const s3bucket = process.env.S3_BUCKET

const s3 = new AWS.S3({
  accessKeyId: accesskeid,
  secretAccessKey: secretaccesskey,
  endpoint: s3endpoint,
  s3ForcePathStyle: true,
  signatureVersion: 'v4',
})

// putObject operation.

const params = {
  Bucket: s3bucket,
  Key: 'testobject3',
  Body: 'Hello from MinIO!!',
}

s3.putObject(params, (err, data) => {
  if (err) console.log(err)
  else console.log('Successfully uploaded data to ', s3bucket, '/testobject3')
})
