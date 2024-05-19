import conversationModel from '../model/Conversation.js';
import { verifyJwtToken } from '../utils/jwtToken.js';

export let getConversation = (async (req, res) => {

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
        const conversationName = req.query.conversationName;
        const conversation = await conversationModel.findOne({name: conversationName});
        res.status(200).json({response: conversation});
    }
    catch(error) {
        res.status(500).json({message: "Server error!"});
    }
});

export let addMessageToConversation = (async (req, res) => {

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
        const {conversationName, from, to, participants, readList, message, hours, minutes, seconds, date, month, year} = req.body;
        let conversation = await conversationModel.findOne({name: conversationName});

        // Conversation does not exist
        if (!conversation) {
            conversation = new conversationModel({"name": conversationName, "messages": []});
        }

        conversation.messages.push(
            {
                from: from, to: to, message: message,
                hours: hours, minutes: minutes, seconds: seconds,
                date: date, month: month, year: year, readList: readList
            }
        );
        conversation.save();
        res.status(200).json({response: "Sent message successfully!"});
    }
    catch(error) {
        res.status(500).json({message: "Server error!"});
    }
});

export let markMessagesOfConversationToRead = (async (req, res) => {

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
        const {conversationName, username} = req.body;
        const conversation = await conversationModel.findOne({name: conversationName});

        // Marking all messages as 'read' by the user 'username'
        await conversationModel.updateOne(
            {name: conversationName},
            {$set: {"messages.$[].readList.$[e].read": true}},
            {arrayFilters: [{"e.username": username}]}
        );

        res.status(200).json({response: "Successfully marked all unread messages as 'read'!"});
    }
    catch(error) {
        res.status(500).json({message: "Server error!"});
    }
});