import { getUser, authenticateUser } from "./users.js";
import userModel from "../models/User.js";
import { generateJwtTokenAndPutInCookie, verifyJwtToken } from "../utils/jwtToken.js";

export let loginUser = async (req, res) => {
    try {
        const {username, password} = req.body;
        const user = await authenticateUser(username, password);

        if (!user) {
            res.status(401).json({message: "Invalid credentials"});
        }
        else {
            generateJwtTokenAndPutInCookie({username: username}, res);
            res.status(200).json({message: "Authorized!"});
        }
    }
    catch(error) {
        res.status(500).json({message: "Login failed!"});
    }
}

export let logoutUser = async (req, res) => {
    try {
        res.clearCookie("jwt");
        res.status(200).json({message: "Logged out!"});
    }
    catch(error) {
        res.status(500).json({message: "Logout failed!"});
    }
}

const MAX_USERNAME_LENGTH = 15;
const MIN_USERNAME_LENGTH = 7;
const MAX_PASSWORD_LENGTH = 15
const MIN_PASSWORD_LENGTH = 7;

function checkCredentials(username, password) {

    // Username checks
    if (username.length == 0) {
        return [false, 'Username cannot be empty. Please choose a valid username'];
    }
    if (username.length < MIN_USERNAME_LENGTH) {
        return [false, `Username needs to be atleast ${MIN_USERNAME_LENGTH} long`];
    }
    if (username.length > MAX_USERNAME_LENGTH) {
        return [false, `Username needs to be atmost ${MAX_USERNAME_LENGTH} long`];
    }

    // Password checks
    if (password.length == 0) {
        return [false, 'Password cannot be empty. Please choose a valid password'];
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
        return [false, `Password needs to be atleast ${MIN_PASSWORD_LENGTH} long`];
    }
    if (password.length > MAX_PASSWORD_LENGTH) {
        return [false, `Password needs to be atmost ${MAX_PASSWORD_LENGTH} long`];
    }

    return [true, 'All good'];
}

export let signupUser = async (req, res) => {
    try {
        const {username, password} = req.body;

        const user = await getUser(username);
        if (user != null) {
            res.status(405).json({message: `A user already exists with the username '${username}. Please choose another username'`});
        }
        else {
            const [status, message] = checkCredentials(username, password);
            if (!status) {
                res.status(401).json({message: message});
                return;
            }

            const newUser = new userModel({"username": username, "password": password, "displayPicture": "default.jpg"});
            newUser.save();
            res.status(200).json({message: "Successfully signed up!"});
        }
    }
    catch(error) {
        res.status(500).json({message: "Signup failed!"});
    }
}

export let checkJwtToken = async (req, res) => {
    try {
        const jwtToken = req.cookies.jwt;
        const username = verifyJwtToken(jwtToken);
        if (username) {
            const user = await getUser(username);
            res.status(200).json(user);
        }
        else {
            res.status(401).json({message: "User unauthorized"});
        }
    }
    catch(error) {
        res.status(401).json({message: "User unauthorized"});
    }
}