import express from 'express';
import bodyParser from 'body-parser';
import { getConversation, addMessageToConversation } from '../controller/conversation.js';

const router = express.Router();
const jsonParser = bodyParser.json();

router.get('/getConversation', jsonParser, getConversation);
router.post('/addMessageToConversation', jsonParser, addMessageToConversation);

export default router;