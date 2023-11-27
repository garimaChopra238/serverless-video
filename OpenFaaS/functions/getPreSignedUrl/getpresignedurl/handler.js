'use strict'
// const S3 = require('aws-sdk/clients/s3'); // no need to install aws-sdk, available without installing for all nodejs lambda functions
const AWS = require('aws-sdk'); // no need to install aws-sdk, available without installing for all nodejs lambda functions
const crypto = require('crypto');

// CHECK THIS----------------
// const s3 = new S3({
//   region: 'ap-south-1',
// });
let s3;

const createPresignedUrl = metaData => {
  configAWS();
  s3 = new AWS.S3();
  // metadata can contain additional info send from the client
  const params = {
    Fields: {
      key: crypto.randomBytes(8).toString('hex'), // returns a random string
      'x-amz-meta-title': metaData.title, // setting object metadata, has to be in the form x-amz-meta-yourmetadatakey
    },
    Conditions: [
      ['starts-with', '$Content-Type', 'video/'], // accept only videos
      ['content-length-range', 0, 500000000], // max size in bytes, 500mb
    ],
    Expires: 60, // url expires after 60 seconds
    Bucket: 'video-intake'
  }
  return new Promise((resolve, reject) => {
    s3.createPresignedPost(params, (err, data) => {
      // we have to promisify s3.createPresignedPost because it does not have a .promise method like other aws sdk methods
      if (err) {
        reject(err)
        return
      }
      resolve(data)
    })
  })
}

const getPreSignedUrl = async (event, context) => {
  try {
    const data = await createPresignedUrl(JSON.parse(event.body));
    context
      .status(200)
      .succeed({ data });
    // return {
    //   statusCode: 200,
    //   body: JSON.stringify({
    //     data,
    //   }),
    // };
  } catch (err) {
    context
      .status(500)
      .fail('Internal server error');
    // return {
    //   statusCode: 500,
    //   body: JSON.stringify({
    //     message: 'Internal server error',
    //   }),
    // }
  }
}

function configAWS() {
  let accessKeyId = fs.readFileSync("/var/openfaas/secrets/shorturl-dynamo-key").toString()
  let secretKey = fs.readFileSync("/var/openfaas/secrets/shorturl-dynamo-secret").toString()

  AWS.config.update({
      region: 'ap-south-1',
      credentials: {
          accessKeyId: accessKeyId,
          secretAccessKey: secretKey
      }
  });
}

module.exports = {
  handler: getPreSignedUrl,
};
