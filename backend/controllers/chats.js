import userModel from "../models/User.js";
import groupChatModel from "../models/GroupChat.js";
import conversationModel from "../models/Conversation.js";
import { verifyJwtToken } from "../utils/jwtToken.js";
import dotenv from "dotenv";
import AWS from "aws-sdk";
import fs from 'fs';

dotenv.config();

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: 'ap-south-1'
});

let getNumberOfUnreadMessagesInConversation = ((username, messages) => {

    let min = 0;
    let max = messages.length - 1;
    let index = -1;

    // Binary searching on all messages to find the number of messages 'unread' by the current user
    while (min <= max) {

        const mid = Math.floor((min + max) / 2);

        const midMessage = messages[mid];
        const readList = midMessage.readList;

        for (let i = 0; i < readList.length; ++i) {

            // Searching for the 'read' status by the current user
            if (readList[i].username != username) {
                continue;
            }

            if (readList[i].read) {
                min = mid + 1;
                break;
            }

            // Message is 'unread'
            index = mid;
            max = mid - 1;
            break;
        }
    }

    return index == -1 ? 0 : messages.length - index;
});

// Returning all chats in order of the last message exchanged
export let getAllChats = async (req, res) => {

    try {
        const jwtToken = req.cookies.jwt;
        const status = verifyJwtToken(jwtToken);

        if (!status) {
            res.status(401).json({message: "User unauthorized!"});
            return;
        }
    }
    catch(error) {
        res.status(401).json({message: "User unauthorized!"});
        return;
    }

    try {
        const username = req.query.username;
        const searchString = req.query.searchString;
        const groupChats = await groupChatModel.find({
            "$and": [
                {name: {$regex: `^${searchString}`}},
                {participants: username}
            ]
        });
        const users = await userModel.find({
            "$and": [
                {username: {$regex: `^${searchString}`}},
                {username: {$ne: username}}
            ]
        });
        const allChats = users.concat(groupChats);

        const groupChatConversationNames = groupChats.map((groupChat) => groupChat.name);
        const directMessageConversationNames = users.map((user) => [user.username, username].sort().join('-'));

        // Conversation names between all chats and the current user
        let allConversationNames = directMessageConversationNames.concat(groupChatConversationNames);

        let allChatObjs = [];
        for (let i = 0; i < allConversationNames.length; ++i) {

            // Conversation between the user and the chat
            const conversation = await conversationModel.findOne({name: allConversationNames[i]});
            const conversationLastMessage = conversation == null ? null : conversation.messages[conversation.messages.length - 1];
            const numberOfUnreadMessagesInConversation = conversation == null ? 0 :
                                                            getNumberOfUnreadMessagesInConversation(username, conversation.messages);

            const message = conversationLastMessage == null ? '' : conversationLastMessage.from + ": " + conversationLastMessage.message;
            const hours = conversationLastMessage == null ? '-1' : conversationLastMessage.hours;
            const minutes = conversationLastMessage == null ? '-1' : conversationLastMessage.minutes;
            const seconds = conversationLastMessage == null ? '-1' : conversationLastMessage.seconds;
            const date = conversationLastMessage == null ? '-1' : conversationLastMessage.date;
            const month = conversationLastMessage == null ? '-1' : conversationLastMessage.month;
            const year = conversationLastMessage == null ? '-1' : conversationLastMessage.year;

            // Storing an object containing the chat name and the information of the last message exchanged
            allChatObjs.push({
                name: allChats[i].name == undefined ? allChats[i].username : allChats[i].name,
                lastMessage: {
                    message: message,
                    hours: hours,
                    minutes: minutes,
                    seconds: seconds,
                    date: date,
                    month: month,
                    year: year
                },
                isGroupChat: allChats[i].name != undefined,
                participants: allChats[i].name != undefined ? allChats[i].participants : [username, allChats[i].username].sort(),
                displayPicture: allChats[i].displayPicture,
                numberOfUnreadMessages: numberOfUnreadMessagesInConversation
            });
        }

        res.status(201).json({response: allChatObjs});
    }
    catch(error) {
        res.status(500).json({message: "Server error!"});
    }
}

export let createGroupChat = async (req, res) => {

    try {
        const jwtToken = req.cookies.jwt;
        const status = verifyJwtToken(jwtToken);

        if (!status) {
            res.status(401).json({message: "User unauthorized!"});
            return;
        }
    }
    catch(error) {
        res.status(401).json({message: "User unauthorized!"});
        return;
    }

    try {
        const {name, participants} = req.body;
        const users = await userModel.find({username: name});

        if (users.length != 0) {
            res.status(405).json({message: "This group name is already taken. Please pick another name for the group chat"});
            return;
        }
    
        const groupChats = await groupChatModel.find({name: name});
        if (groupChats.length != 0) {
            res.status(405).json({message: "This group name is already taken. Please pick another name for the group chat"});
            return;
        }

        const newGroupChat = new groupChatModel({"name": name, "displayPicture": "default.jpg", "participants": participants});
        newGroupChat.save();
        res.status(201).json({message: "Group chat successfully created!"});
    }
    catch(error) {
        res.status(500).json({message: "Server error!"});
        return;
    }
}

export let updateDisplayPictureOfChat = async (req, res) => {

    try {
        const name = req.body.name;
        const newDisplayPicture = req.body.newDisplayPicture;
        const previousDisplayPicture = req.body.previousDisplayPicture;
        const imageContent = fs.readFileSync(`./uploads/${newDisplayPicture}`);
        s3.putObject({
            Body: imageContent,
            Bucket: "chat-application-display-pictures-bucket",
            Key: newDisplayPicture
        }, (error, data) => {
            // Deleting the temporary image file that was saved
            fs.unlinkSync(`./uploads/${newDisplayPicture}`);
            if (error) {
                res.status(500).json({message: "Server error!"});
                return;
            }
        });

        // Deleting the old display picture from s3
        if (previousDisplayPicture != 'default.jpg' && previousDisplayPicture != newDisplayPicture) {
            s3.deleteObject({
                Bucket: "chat-application-display-pictures-bucket",
                Key: previousDisplayPicture
            }, (error, data) => {
                if (error) {
                    res.status(500).json({message: "Server error!"});
                    return;
                }
            });
        }

        await userModel.updateOne({username: name}, {$set: {"displayPicture": newDisplayPicture}});
        await groupChatModel.updateOne({name: name}, {$set: {"displayPicture": newDisplayPicture}});

        res.status(201).json({message: "Display picture successfully updated!"});
    }
    catch(error) {
        res.status(500).json({message: "Server error!"});
    }
}

export let removeDisplayPictureOfChat = async (req, res) => {

    try {
        const name = req.body.name;
        await userModel.updateOne({username: name}, {$set: {"displayPicture": 'default.jpg'}});
        await groupChatModel.updateOne({name: name}, {$set: {"displayPicture": 'default.jpg'}});
        res.status(201).json({message: "Display picture successfully updated!"});
    }
    catch(error) {
        res.status(500).json({message: "Server error!"});
    }
}