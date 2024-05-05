import userModel from "../model/User.js";
import groupChatModel from "../model/GroupChat.js"
import { verifyJwtToken } from "../utils/jwtToken.js";

export let getAllChats = async (req, res) => {

    const startString = req.query.startString;
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

    const groupChats = await groupChatModel.find({name: {$regex: `^${startString}`}});
    const users = await userModel.find({username: {$regex: `^${startString}`}});

    const allChats = groupChats.concat(users);
    res.status(201).json({response: allChats});
}