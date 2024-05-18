import express from 'express';
import bodyParser from 'body-parser';
import multer from 'multer';
import { createGroupChat, getAllChats, updateDisplayPictureOfChat, removeDisplayPictureOfChat } from '../controller/chats.js';

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        return cb(null, "./uploads");
    },
    filename: function(req, file, cb) {
        return cb(null, req.body.newDisplayPicture);
    }
});
const upload = multer({storage: storage});
const router = express.Router();
const jsonParser = bodyParser.json();

router.get('/getAllChats', jsonParser, getAllChats);
router.post('/createGroupChat', jsonParser, createGroupChat);
router.post('/updateDisplayPictureOfChat', jsonParser, upload.single('image'), updateDisplayPictureOfChat);
router.post('/removeDisplayPictureOfChat', jsonParser, removeDisplayPictureOfChat);

export default router;