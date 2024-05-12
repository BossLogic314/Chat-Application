import mongoose from "mongoose";

let userSchema = {
    username: String,
    password: String
}

let userModel = mongoose.model('Users', userSchema, 'Users');

export default userModel;