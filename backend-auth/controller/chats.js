import userModel from "../model/User.js";
import groupChatModel from "../model/GroupChat.js";
import conversationModel from "../model/Conversation.js";
import { verifyJwtToken } from "../utils/jwtToken.js";

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
        const groupChats = await groupChatModel.find({name: {$regex: `^${searchString}`}});
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
                    hours: hours,
                    minutes: minutes,
                    seconds: seconds,
                    date: date,
                    month: month,
                    year: year
                },
                isGroupChat: allChats[i].name != undefined
            });
        }
        console.log(allChatObjs);

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

        const newGroupChat = new groupChatModel({"name": name, "participants": participants});
        newGroupChat.save();
        res.status(201).json({message: "Group chat successfully created!"});
    }
    catch(error) {
        res.status(500).json({message: "Server error!"});
        return;
    }
}