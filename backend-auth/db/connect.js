import mongoose from "mongoose";

const DB_URL = 'mongodb+srv://bhagavatulaanish:anish@democluster.ucjttun.mongodb.net/DemoDatabase?retryWrites=true&w=majority&appName=DemoCluster';

let connectToDb = () => {

    mongoose.connect(DB_URL)
    .then(() => {
        console.log('Connected to DB');
    })
    .catch(() => {
        console.log('Could not connect to DB');
    })
}

export default connectToDb;