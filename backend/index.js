import express from "express";
import authRouter from './routes/authentication.js';
import usersRouter from './routes/users.js';
import chatsRouter from './routes/chats.js';
import conversationRouter from './routes/conversation.js';
import connectToDb from "./db/connect.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express()
const PORT = 3100;

// Calling the method to connect to MongoDB
connectToDb();

app.use(cors({
	credentials: true,
    origin: [process.env.NEXT_PUBLIC_FRONTEND_URL]
}));
app.use(express.json());
app.use(cookieParser());
app.use('/auth', authRouter);
app.use('/users', usersRouter);
app.use('/chats', chatsRouter);
app.use('/conversation', conversationRouter);

app.listen(PORT, () => {
    console.log(`Application started on port ${PORT}`);
});