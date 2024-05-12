import mongoose from "mongoose";

let conversationSchema = {
    name: String,
    participants: Array,
    messages: Array
}

let conversationModel = mongoose.model('Conversations', conversationSchema, 'Conversations');

export default conversationModel;