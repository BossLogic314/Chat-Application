import userModel from "../model/User.js";
import groupChatModel from "../model/GroupChat.js"
import { verifyJwtToken } from "../utils/jwtToken.js";

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
    
        const allChats = groupChats.concat(users);
        res.status(201).json({response: allChats});
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