import userModel from '../model/User.js';

export let getUser = (async (username, password) => {
    const user = await userModel.findOne({"username": username, "password": password});
    return user;
});