import {NextFunction, Request, Response} from "express";

export function requireAuthentication(req: Request, res: Response, next: NextFunction) {
    const userId = req.session?.userId;

    if (userId) {
        next();
    } else {
        res.status(401).send();
    }
}
