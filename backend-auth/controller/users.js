import userModel from '../model/User.js';
import { verifyJwtToken } from '../utils/jwtToken.js';

export let authenticateUser = async (username, password) => {
    const user = await userModel.findOne({"username": username, "password": password});
    return user;
};

export let getUser = async (username) => {
    const user = await userModel.findOne({"username": username});
    return user;
};

export let getUsers = async (req, res) => {

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
        const users = await userModel.find({});
        res.status(200).json({users: users});
    }
    catch(error) {
        res.status(500).json({message: "Server error!"});
    }
};