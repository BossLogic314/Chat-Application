import express from 'express';
import bodyParser from 'body-parser';
import { authenticateUser, signupUser } from '../controller/users.js';
import { generateJwtTokenAndPutInCookie } from '../utils/generateJwtToken.js';

const router = express.Router();
const jsonParser = bodyParser.json();

router.get('/login', jsonParser, async (req, res) => {

    const {username, password} = req.body;
    const user = await authenticateUser(username, password);

    if (user === null) {
        res.status(401).json({message: "Invalid credentials"});
    }
    else {
        generateJwtTokenAndPutInCookie(user, res);
        res.status(200).json({message: "Access granted"});
    }
});

router.get('/signup', jsonParser, async (req, res) => {

    const {username, password} = req.body;
    const result = await signupUser(username, password);

    if (result.status == true) {
        res.status(200).json({message: result.message});
    }
    else {
        res.status(401).json({message: result.message});
    }
});

export default router;