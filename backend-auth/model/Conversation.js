import mongoose from "mongoose";

let conversationSchema = {
    name: {
        type: String,
        unique: true,
        required: true
    },
    participants: {
        type: Array,
        required: true
    },
    messages: {
        type: Array,
        required: true
    }
}

let conversationModel = mongoose.model('Conversations', conversationSchema, 'Conversations');

export default conversationModel;