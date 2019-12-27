import * as aws from "aws-sdk";
import database from "../database";

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

        const imageUrl = `https://${S3_BUCKET}.s3.amazonaws.com/${itemId}`;
        return database.none(`UPDATE item
                              SET image_url = $1
                              WHERE item.id = $2;`,
            [imageUrl, itemId])
            .then(() => {
                const s3Params = {
                    Bucket: S3_BUCKET,
                    Key: itemId,
                    Expires: 500,
                    ACL: 'public-read',
                    ContentType: 'image/jpeg'
                };
                return s3.getSignedUrlPromise('putObject', s3Params);
            }).catch(error => {
                throw new Error('Error when creating image upload link: ' + error);
            });
    }
}
