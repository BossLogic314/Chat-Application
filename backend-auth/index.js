import express from "express";
import authRouter from './routes/authentication.js';
import usersRouter from './routes/users.js';
import chatsRouter from './routes/chats.js';
import conversationRouter from './routes/conversation.js';
import connectToDb from "./db/connect.js";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express()
const PORT = 8080;

// Calling the method to connect to MongoDB
connectToDb();

app.use(cors({
	credentials: true,
    origin: ["http://localhost:3000"]
}));
app.use(express.json());
app.use(cookieParser());
app.use('/auth', authRouter);
app.use('/users', usersRouter);
app.use('/chats', chatsRouter);
app.use('/conversation', conversationRouter);

app.get('/', (req, res) => {
    res.send('Hi Anish!');
});

app.listen(PORT, () => {
    console.log(`Application started on port ${PORT}`);
});