import userModel from '../model/User.js';

export let authenticateUser = (async (username, password) => {
    const user = await userModel.findOne({"username": username, "password": password});
    return user;
});

export let getUser = (async (username) => {
    const user = await userModel.findOne({"username": username});
    return user;
});

export let signupUser = (async (username, password) => {
    
    const user = await getUser(username);
    if (user != null) {
        return {status: false, message: `A user already exists with the username ${username}`};
    }

    const newUser = new userModel({"username": username, "password": password});
    newUser.save();
    
    return {status: true, message: `Successfully signed up`};
});