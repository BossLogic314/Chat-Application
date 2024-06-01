import mongoose from "mongoose";

let groupChatSchema = {
    name: String,
    participants: Array,
    displayPicture: String
}

let groupChatModel = mongoose.model('GroupChats', groupChatSchema, 'GroupChats');

export default groupChatModel;