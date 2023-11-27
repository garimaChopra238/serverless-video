const AWS = require('aws-sdk');
const { config } = require('dotenv');

// AWS.config.update({
//   region: 'ap-south-1',
// });

// const dynamoDb = new AWS.DynamoDB.DocumentClient();
// const cloudfront = new AWS.CloudFront();

const finalize = async event => {
  configAWS();
  dynamoDb = new AWS.DynamoDB.DocumentClient();
  if (!cloudfront) {
    cloudfront = new AWS.CloudFront();
  }
  try {
    const id = event[4].id;

    const dynamoParams = {
      TableName: 'videos',
      Key: {
        id,
      },
      UpdateExpression: 'set #videoStatus = :x',
      ExpressionAttributeNames: { '#videoStatus': 'status' }, // because status is reserved keyword in dynamoDb
      ExpressionAttributeValues: {
        ':x': 'finished',
      },
    };

    await dynamoDb.update(dynamoParams).promise(); // updates status of the video
    console.log('Successfully updated video status');

    const cloudfrontParams = {
      DistributionId: process.env.CLOUDFRONT_ID,
      InvalidationBatch: {
        CallerReference: Date.now().toString(),
        Paths: {
          Quantity: 1,
          Items: [`/${id}/*`],
        },
      },
    };

    await cloudfront.createInvalidation(cloudfrontParams).promise(); // invalidates cloudfront distribution
    console.log('cloudfront invalidated');
  } catch (err) {
    console.error(err);
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
  handler: finalize,
};