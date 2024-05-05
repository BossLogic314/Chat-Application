import userModel from "../model/User.js";
import groupChatModel from "../model/GroupChat.js"
import { verifyJwtToken } from "../utils/jwtToken.js";

export let getAllChats = async (req, res) => {

    try {
        const jwtToken = req.cookies.jwt;
        const status = verifyJwtToken(jwtToken);

        if (!status) {
            res.status(401).json({message: "User unauthorized!"});
        }
    }
    catch(error) {
        res.status(401).json({message: "User unauthorized!"});
    }

    const groupChats = await groupChatModel.find();
    const users = await userModel.find();

    const allChats = (await groupChats).concat(users);
    res.status(201).json({response: allChats});
}