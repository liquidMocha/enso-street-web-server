import express, {NextFunction, Request, Response} from "express";

const router = express.Router();

async function getDeliveryQuote(req: Request, res: Response, next: NextFunction) {
    res.status(200).json(32.91);
}

router.post('/delivery-quote', getDeliveryQuote)

export default router;
