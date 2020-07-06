const AWS = require('aws-sdk');

AWS.config.update({
  accessKeyId: process.env.AWSACCESSKEYID,
  secretAccessKey: process.env.AWSSECRETACCESSKEY
});

module.exports.getsimages = async (req, res) => {
  try {
    console.log(req.query.folder);
    let s3 = new AWS.S3({
      params: {
        Bucket: process.env.AWSBUCKET,
        Prefix: req.query.folder ? 'sitecommon/images/' + req.query.folder : 'sitecommon/images'
      }
    });

    let data = await s3.listObjects().promise();

    let imgArr = data.Contents.filter(content => {
      return content.Key.indexOf('.') > -1;
    });

    imgArr = imgArr.map(content => {
      return '//d16hdrba6dusey.cloudfront.net/' + content.Key;
    });

    res.json(imgArr)
  }
  catch(e) {
    console.log(e);
  }
}
