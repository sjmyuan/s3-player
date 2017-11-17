const AWS = require('aws-sdk');
const _ = require('lodash');

module.exports.play = (event, context, cb) => {
  const bucketName = _.get(event, 'queryStringParameters.bucket');
  const key = _.get(event, 'queryStringParameters.key');

  const s3 = new AWS.S3();
  const params = {
    Bucket: bucketName,
    Key: key,
  };
  s3.headObject(params).promise()
    .then(() => {
      const url = s3.getSignedUrl('getObject', params);
      const html = `<!DOCTYPE html> 
        <html> 
        <body> 
        <video width="400" controls>
        <source src="${url}" type="video/mp4">
        Your browser does not support HTML5 video.
        </video>
        </body> 
        </html>`;
      cb(null, { statusCode: 200, headers: { 'Content-Type': 'text/html' }, body: html });
    })
    .catch((err) => {
      cb(null, { statusCode: 404, headers: { 'Content-Type': 'text/html' }, body: JSON.stringify(`File does not exist,error is ${err}`) });
    });
};
