'use strict'
const AWS = require('aws-sdk');

// AWS.config.update({
//   region: 'ap-south-1',
// });

let stepFunctions;

module.exports = async (event, context) => {
  const id = event.Records[0].s3.object.key; // event object contains payload from s3 trigger
  
  configureAWS(); // configure aws
  stepFunctions = new AWS.StepFunctions();
  
  try {
    const stateMachineParams = {
      // CHECK THIS---------------
      stateMachineArn: process.env.STEP_FUNCTION_ARN,
      input: JSON.stringify({ id }), // input to step function
    };
    stepFunctions.startExecution(stateMachineParams, (err, data) => {
      // starts step function execution
      if (err) {
        console.error(err);
        context
          .status(500)
          .fail('Error starting step function execution');
      } else {
        console.log(data);
        context
          .status(200)
          .succeed({ message: 'Step function worked' });
      }
    });
  } catch (err) {
    console.error(err);
  }
};

function configureAWS() {
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