import express, {NextFunction, Request, Response} from "express";
import ImageRepository from "./ImageRepository";
import {uuid} from "uuidv4";

const router = express.Router();

router.get('/signedS3Request', getSignedS3RequestEndpoint);

async function getSignedS3RequestEndpoint(req: Request, res: Response, next: NextFunction) {
    const key = uuid();
    const signedRequest = await ImageRepository.getSignedS3Request(key);

    res.status(200).json({
        uploadRequest: signedRequest,
        imageUrl: `https://${process.env.Bucket}.s3.amazonaws.com/${key}`
    });
}

export default router;
