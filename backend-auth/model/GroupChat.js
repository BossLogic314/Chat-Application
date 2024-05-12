import mongoose from "mongoose";

let groupChatSchema = {
    name: String,
    participants: Array
}

let groupChatModel = mongoose.model('GroupChats', groupChatSchema, 'GroupChats');

export default groupChatModel;