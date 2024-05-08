import express from 'express';
import bodyParser from 'body-parser';
import { getConversation } from '../controller/conversation.js';

const router = express.Router();
const jsonParser = bodyParser.json();

router.get('/getConversation', jsonParser, getConversation);

export default router;