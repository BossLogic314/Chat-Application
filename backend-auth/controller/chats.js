import userModel from "../model/User.js";
import groupChatModel from "../model/GroupChat.js"
import { verifyJwtToken } from "../utils/jwtToken.js";

export let getAllChats = async (req, res) => {

    const searchString = req.query.searchString;
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

    const groupChats = await groupChatModel.find({name: {$regex: `^${searchString}`}});
    const users = await userModel.find({username: {$regex: `^${searchString}`}});

    const allChats = groupChats.concat(users);
    res.status(201).json({response: allChats});
}

export let createGroupChat = async (req, res) => {

    const {name, participants} = req.body;
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

    try {
        const newGroupChat = new groupChatModel({"name": name, "participants": participants});
        newGroupChat.save();
        res.status(201).json({message: "Group chat successfully created!"});
    }
    catch(error) {
        res.status(500).json({message: "Group chat creation failed!"});
    }
}