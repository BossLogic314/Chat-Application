import express from 'express';
import bodyParser from 'body-parser';
import { checkJwtToken, loginUser, logoutUser, signupUser } from '../controllers/authentication.js';

const router = express.Router();
const jsonParser = bodyParser.json();

router.post('/login', jsonParser, loginUser);
router.post('/logout', jsonParser, logoutUser);
router.post('/signup', jsonParser, signupUser);
router.get('/checkJwtToken', jsonParser, checkJwtToken);

export default router;