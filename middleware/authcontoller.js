const jwt = require('jsonwebtoken');

const protectAuth = async (req, res, next) => {
    const { authorization } = req.headers;
    if (!authorization) {
        return res.status(401).json({
            status: 'error',
            message: 'You must be logged in!'
        });
    }

    try {
        // 2) Verifying token
        req.token = authorization.split(" ")[1];
        console.log(req.token)
        console.log(authorization)
        jwt.verify(req.token, process.env.JWT_SECRET, (err, authData) => {
            if (err) {
                return res.status(401).json({
                    status: "error",
                    message: "Malformed sign-in token! Please use a valid sign-in token to continue.",
                    data: null
                });
            }
            req.user = authData;
            console.log(req.user)
            next();
        });
    } catch (error) {
        res.status(401).json({
            status: 'error',
            message: error.message
        });
        console.log(error);
    }
};

module.exports=protectAuth;