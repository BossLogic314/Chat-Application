import express from 'express';
import bodyParser from 'body-parser';
import { getUser } from '../controller/users.js';
import { Jwt } from 'jsonwebtoken';

const router = express.Router();
const jsonParser = bodyParser.json();

router.get('/login', jsonParser, async (req, res) => {

    const {username, password} = req.body;
    const users = await getUser(username, password);

    res.json(users);
});

router.get('/signup', (req, res) => {
    res.send('in signup');
});

export default router;