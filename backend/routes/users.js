import express from 'express';
import bodyParser from 'body-parser';
import { getUsers } from '../controllers/users.js';

const router = express.Router();
const jsonParser = bodyParser.json();

router.get('/getUsers', jsonParser, getUsers);

export default router;