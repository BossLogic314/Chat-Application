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

export let addMessageToConversation = (async (req, res) => {

    const {conversationName, participants, from, to, message, hours, minutes, seconds, date, month, year} = req.body;
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
        conversation.messages.push(
            {
                from: from, to: to, message: message,
                hours: hours, minutes: minutes, seconds: seconds,
                date: date, month: month, year: year
            }
        );
        conversation.save();
        res.status(200).json({response: "Sent message successfully!"});
    }
    catch(error) {
        res.status(500).json({message: "Server error!"});
    }
});