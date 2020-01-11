import * as aws from "aws-sdk";

aws.config.update({
    region: 'us-east-2',
    accessKeyId: process.env.AWSAccessKeyId,
    secretAccessKey: process.env.AWSSecretKey
});

export default class ImageRepository {
    static getSignedS3Request(itemId) {
        const S3_BUCKET = process.env.Bucket;
        const s3 = new aws.S3({
            signatureVersion: 'v4'
        });

        const s3Params = {
            Bucket: S3_BUCKET,
            Key: itemId,
            Expires: 500,
            ACL: 'public-read',
            ContentType: 'image/jpeg'
        };
        return s3.getSignedUrlPromise('putObject', s3Params);
    }
}
