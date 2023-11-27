'use strict'
const AWS = require('aws-sdk');

// AWS.config.update({
//   region: 'ap-south-1',
// });

let dynamoDb

const getVideos = async (context) => {
  configAWS()
  dynamoDb = new AWS.DynamoDB.DocumentClient();
  
  try {
    const params = {
      TableName: 'videos',
    };

    const videos = await dynamoDb.scan(params).promise();
    context
      .status(200)
      .succeed(videos.Items)
    // return {
    //   statusCode: 200,
    //   body: JSON.stringify(videos.Items),
    // };

  } catch (err) {
    console.error(err);
    context
      .status(500)
      .fail('Internal server error')
    // return {
    //   statusCode: 500,
    //   body: JSON.stringify({
    //     message: 'Internal server error',
    //   }),
    // };
  }
};

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
  handler: getVideos,
};
