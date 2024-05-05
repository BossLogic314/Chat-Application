import mongoose from "mongoose";

let groupChatSchema = {
    chatName: {
        type: String,
        unique: true,
        required: true
    },
    users: {
        type: Array,
        required: true
    }
}

let groupChatModel = mongoose.model('GroupChats', groupChatSchema, 'GroupChats');

export default groupChatModel;