import mongoose from "mongoose";

let groupChatSchema = {
    name: {
        type: String,
        unique: true,
        required: true
    },
    participants: {
        type: Array,
        required: true
    }
}

let groupChatModel = mongoose.model('GroupChats', groupChatSchema, 'GroupChats');

export default groupChatModel;