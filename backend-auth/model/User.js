import mongoose from "mongoose";

let userSchema = {
    username: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    }
}

let userModel = mongoose.model('Users', userSchema, 'Users');

export default userModel;