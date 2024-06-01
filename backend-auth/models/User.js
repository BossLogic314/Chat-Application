import mongoose from "mongoose";

let userSchema = {
    username: String,
    password: String,
    displayPicture: String
}

let userModel = mongoose.model('Users', userSchema, 'Users');

export default userModel;