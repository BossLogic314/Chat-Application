import express from 'express';
import bodyParser from 'body-parser';
import { getAllChats } from '../controller/chats.js';

const router = express.Router();
const jsonParser = bodyParser.json();

router.get('/getAllChats', jsonParser, getAllChats);

export default router;