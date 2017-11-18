const AWS = require('aws-sdk');
const _ = require('lodash');

module.exports.play = (event, context, cb) => {
  const bucketName = _.get(event, 'queryStringParameters.bucket');
  const key = _.get(event, 'queryStringParameters.key');

  const s3 = new AWS.S3();
  const params = {
    Bucket: bucketName,
    Key: key,
    Expires: 7200,
  };

  s3.headObject({ Bucket: bucketName, Key: key }).promise()
    .then(() => {
      const url = s3.getSignedUrl('getObject', params);
      const html = `<!DOCTYPE html> 
        <html> 
        <body> 
        <video width="400" controls autoplay>
        <source src="${url}" type="video/mp4">
        Your browser does not support HTML5 video.
        </video>
        </body> 
        </html>`;
      cb(null, { statusCode: 200, headers: { 'Content-Type': 'text/html' }, body: html });
    })
    .catch((err) => {
      cb(null, { statusCode: 404, headers: { 'Content-Type': 'text/html' }, body: `File does not exist,error is ${err}` });
    });
};

module.exports.list = (event, context, cb) => {
  const bucketName = _.get(event, 'queryStringParameters.bucket');
  const domain = process.env.domain;

  const s3 = new AWS.S3();
  const params = {
    Bucket: bucketName,
  };

  s3.listObjects(params).promise().then((data) => {
    const files = data.Contents.map(x => x.Key);
    const liDoms = files.map(x => `<li><a href="https://${domain}/stg/play?bucket=${bucketName}&key=${x}">${x}</a></li>`);
    const olDom = `<ol>${liDoms.join('\n')}</ol>`;
    const html = `<!DOCTYPE html>
        <html>
        <body>
           ${olDom}
        </body>
        </html>`;
    cb(null, { statusCode: 200, headers: { 'Content-Type': 'text/html' }, body: html });
  }).catch((err) => {
    cb(null, { statusCode: 500, headers: { 'Content-Type': 'text/html' }, body: `Unexpected error,error is ${err}` });
  });
};
