import express from 'express';
import bodyParser from 'body-parser';
import { loginUser, signupUser } from '../controller/authentication.js';
import { verifyJwtToken } from '../utils/jwtToken.js';

const router = express.Router();
const jsonParser = bodyParser.json();

router.post('/login', jsonParser, loginUser);
router.post('/signup', jsonParser, signupUser);

export default router;