import express from 'express';
import bodyParser from 'body-parser';
import { getConversation, addMessageToConversation, markMessagesOfConversationToRead } from '../controllers/conversation.js';

const router = express.Router();
const jsonParser = bodyParser.json();

router.get('/getConversation', jsonParser, getConversation);
router.post('/addMessageToConversation', jsonParser, addMessageToConversation);
router.post('/markMessageOfConversationAsRead', jsonParser, markMessagesOfConversationToRead);

export default router;