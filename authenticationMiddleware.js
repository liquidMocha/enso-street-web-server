const authenticationMiddleware = (req, res, next) => {
    console.log('authenticationMiddleware req: ', req);
    if (req.isAuthenticated()) {
        return next()
    }
    res.status(401).send();
};

export default authenticationMiddleware;