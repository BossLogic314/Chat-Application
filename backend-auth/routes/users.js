import express from 'express';
import bodyParser from 'body-parser';
import { getUsers } from '../controller/users.js';
import { verifyJwtToken } from '../utils/jwtToken.js';

const router = express.Router();
const jsonParser = bodyParser.json();

router.get('/getUsers', jsonParser, getUsers);

export default router;