import conversationModel from '../model/Conversation.js';
import { verifyJwtToken } from '../utils/jwtToken.js';

export let getConversation = (async (req, res) => {

    const conversationName = req.query.conversationName;
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
        const conversation = await conversationModel.findOne({name: conversationName});
        res.status(200).json({response: conversation});
    }
    catch(error) {
        res.status(500).json({message: "Server error!"});
    }
});