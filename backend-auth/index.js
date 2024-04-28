import express from "express";
import authRouter from './routes/authentication.js';
import connectToDb from "./db/connect.js";

const app = express()
const PORT = 8080;

// Calling the method to connect to MongoDB
connectToDb();

app.use('/auth', authRouter);
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hi Anish!');
});

app.listen(PORT, () => {
    console.log(`Application started on port ${PORT}`);
});