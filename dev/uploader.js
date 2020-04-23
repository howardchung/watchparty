require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
var s3 = require('s3-client');

var client = s3.createClient({
  maxAsyncS3: 20, // this is the default
  s3RetryCount: 3, // this is the default
  s3RetryDelay: 1000, // this is the default
  multipartUploadThreshold: 2097152000,
  multipartUploadSize: 15728640, // this is the default (15 MB)
  s3Options: {
    accessKeyId: process.env.SCW_ACCESS_KEY,
    secretAccessKey: process.env.SCW_SECRET_KEY,
    endpoint: 's3.fr-par.scw.cloud',
    // endpoint: 's3.yourdomain.com',
    // sslEnabled: false
    // any other options are passed to new AWS.S3()
    // See: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Config.html#constructor-property
  },
});

var params = {
  localDir: '/var/www/html',
  deleteRemoved: false, // default false, whether to remove s3 objects that have no corresponding local file.
  s3Params: {
    Bucket: 'hcmedia',
    Prefix: '',
  },
  getS3Params: (localFile, stat, callback) => {
    // call callback like this:
    var s3Params = {
      // if there is no error
      Key: localFile.replace(/ /g, '.'),
      ACL: 'public-read',
      // other options supported by putObject, except Body and ContentLength.
      // See: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#putObject-property
    };
    // pass `null` for `s3Params` if you want to skip uploading this file.
    callback(null, s3Params);
  },
};
var uploader = client.uploadDir(params);
uploader.on('error', function (err) {
  console.error('unable to sync:', err.stack);
});
uploader.on('progress', function () {
  console.log('progress', uploader.progressAmount, uploader.progressTotal);
});
uploader.on('end', function () {
  console.log('done uploading');
});
