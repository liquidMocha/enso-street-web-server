import express from "express";
import ImageRepository from "./ImageRepository";
import uuidv4 from 'uuid/v4';

const router = express.Router();

router.get('/signedS3Request', async (req, res, next) => {
    const key = uuidv4();
    const signedRequest = await ImageRepository.getSignedS3Request(key);

    res.status(200).json({
        uploadRequest: signedRequest,
        imageUrl: `https://${process.env.Bucket}.s3.amazonaws.com/${key}`
    });
});

export default router;