import express from 'express';
import bodyParser from 'body-parser';
import { loginUser, signupUser } from '../controller/authentication.js';

const router = express.Router();
const jsonParser = bodyParser.json();

router.get('/login', jsonParser, loginUser);
router.get('/signup', jsonParser, signupUser);

export default router;