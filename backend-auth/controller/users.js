import userModel from '../model/User.js';

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
        const users = await userModel.find({});
        res.status(200).json({users: users});
    }
    catch(error) {
        res.status(500).json({message: "Server error!"});
    }
};