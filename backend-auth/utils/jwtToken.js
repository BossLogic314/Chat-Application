import jwt from 'jsonwebtoken';

const ACCESS_TOKEN_SECRET = '0a2bcafcdfcb37a56eafaf86b0a4b7f7690f21cb7dbb5ed9b14262d59ad77ad51d2d7d45cba32773ee9a816b90b54b44518c034a5ee9e889ebe8f2d2e1cf0b1a';

export let generateJwtTokenAndPutInCookie = (jsonObj, res) => {
    try {
        const jwtToken = jwt.sign(jsonObj, ACCESS_TOKEN_SECRET);
        res.cookie("jwt", jwtToken, {maxAge: 1000 * 60 * 60 * 24, httpOnly: true});
    }
    catch(error) {
        res.status(500).json({message: "Server error!"});
    }
}

export let verifyJwtToken = async (req, res, next) => {

    try {
        //res.status(200).json({cookie: req.cookie});
        const jwtToken = req.cookies.jwt;
        if (!jwtToken) {
            res.status(401).json({message: "JWT token is missing in the request"});
        }
        else {
            jwt.verify(jwtToken, ACCESS_TOKEN_SECRET);
            next();
        }
    }
    catch(err) {
        res.status(500).json({message: "Unauthorized: Invalid token!"});
    }
};