import { getUser, authenticateUser } from "./users.js";
import userModel from "../model/User.js";
import { generateJwtTokenAndPutInCookie } from "../utils/jwtToken.js";

export let loginUser = async (req, res) => {

    try {
        const {username, password} = req.body;
        const user = await authenticateUser(username, password);
    
        if (!user) {
            res.status(401).json({message: "Invalid credentials"});
        }
        else {
            generateJwtTokenAndPutInCookie(user._id.toJSON(), res);
            res.status(200).json({message: "Authorized"});
        }
    }
    catch(error) {
        res.status(500).json({message: "Login failed!"});
    }
}

export let signupUser = async (req, res) => {

    try {
        const {username, password} = req.body;

        const user = await getUser(username);
        if (user != null) {
            res.status(405).json({message: `A user already exists with the username '${username}'`});
        }
        else {
            const newUser = new userModel({"username": username, "password": password});
            newUser.save();
            res.status(200).json({message: "Successfully signed up!"});
        }
    }
    catch(error) {
        res.status(500).json({message: "Signup failed!"});
    }
}