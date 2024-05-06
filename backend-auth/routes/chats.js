import express from 'express';
import bodyParser from 'body-parser';
import { createGroupChat, getAllChats } from '../controller/chats.js';

const router = express.Router();
const jsonParser = bodyParser.json();

router.get('/getAllChats', jsonParser, getAllChats);
router.post('/createGroupChat', jsonParser, createGroupChat);

export default router;