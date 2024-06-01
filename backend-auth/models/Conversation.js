import mongoose from "mongoose";

let conversationSchema = {
    name: String,
    participants: Array,
    messages: [
        {
            from: String,
            to: String,
            message: String,
            hours: String,
            minutes: String,
            seconds: String,
            date: String,
            month: String,
            year: String,
            readList: [
                {
                    username: String,
                    read: Boolean
                }
            ]
        }
    ]
}

let conversationModel = mongoose.model('Conversations', conversationSchema, 'Conversations');

export default conversationModel;